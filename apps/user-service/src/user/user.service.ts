import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import {
  Prisma,
  Team,
  User,
  UserRole,
  UserStatus,
} from '../generated/prisma-client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthContextDto } from '../common/interfaces/auth-context.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsService } from '../mail/notifications/notifications.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  // Injection du PrismaService via le constructeur
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  // ──────────────────────────────────────────────────────────────
  // Méthodes génériques existantes (inchangées)
  // ──────────────────────────────────────────────────────────────

  /**
   * Récupère un utilisateur unique à partir d'un critère unique
   * (ex: id, email, username, etc.)
   */
  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  /**
   * Récupère un utilisateur unique à partir d'un identifiant unique
   * (ex: id, email, username, etc.)
   */
  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }],
      },
    });
  }

  /**
   * Récupère une liste d'utilisateurs avec options avancées
   * (pagination, filtrage, tri, curseur)
   */
  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  /**
   * Crée un nouvel utilisateur dans la base de données
   */
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  /**
   * Met à jour un utilisateur existant
   */
  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  /**
   * Supprime un utilisateur de la base de données
   */
  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.update({
      data: { deletedAt: new Date() }, // Marque l'utilisateur comme supprimé
      where,
    });
  }

  // ──────────────────────────────────────────────────────────────
  // Méthodes spécifiques ajoutées pour /users (message patterns)
  // ──────────────────────────────────────────────────────────────

  /**
   * POST /auth/users — Crée un User dans la Team du requester.
   * Réservé au CREATOR. Le rôle CREATOR ne peut pas être attribué ici.
   */
  async createUserInTeam(dto: CreateUserDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    message: string;
  }> {
    try {
      const { username, email, password, accessPolicy, role, requester } = dto;

      this.logger.log(`Message received USERS-CREATE: (${requester.sub})`);

      this.logger.log(
        `Message received on UsersService => CreateInTeam (${email})`,
      );

      const userCreator = await this.checkUser(requester);

      if (userCreator.role === UserRole.CLIENT) {
        throw new RpcException({
          statusCode: 403,
          message:
            'Seul le créateur/admin de la team peut ajouter un utilisateur',
        });
      }

      if (role === UserRole.CREATOR) {
        throw new RpcException({
          statusCode: 400,
          message:
            'Le rôle CREATOR ne peut pas être attribué via cette méthode',
        });
      }

      if (role === UserRole.ADMIN && userCreator.role == UserRole.ADMIN) {
        throw new RpcException({
          statusCode: 400,
          message: 'Un Admin ne peut pas créer un autre admin',
        });
      }

      const existing = await this.findByIdentifier(email);
      if (existing) {
        throw new RpcException({
          statusCode: 409,
          message: 'Un utilisateur avec cet email existe déjà',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.createUser({
        username,
        email,
        passwordHash: hashedPassword,
        role: role ?? UserRole.CLIENT,
        accessPolicy: { ...accessPolicy },
        team: { connect: { id: requester.teamId } },
      });

      const { passwordHash: _omit, ...safeUser } = user;
      return {
        user: safeUser,
        message: "L'utilisateur a été crée avec succès.",
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`User creation failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message: "Une erreur est survenue lors de la création de l'utilisateur",
      });
    }
  }

  /**
   * Bonus — GET /auth/users : liste les Users actifs de la Team du requester.
   */
  async findUsersByTeam(dto: GetUsersDto): Promise<{
    users: Omit<User, 'passwordHash'>[];
    team: Team;
    total: number;
    page: number;
    limit: number;
    success: boolean;
  }> {
    const { requester } = dto;

    this.logger.log(`Message received USERS-GET-MANY: (${requester.sub})`);

    const userCreator = await this.checkUser(requester);
    const team = await this.prisma.team.findFirst({
      where: {
        id: requester.teamId,
      },
    });

    if (userCreator.role === UserRole.CLIENT) {
      throw new RpcException({
        statusCode: 403,
        message:
          'Seul les créateur/admin de la team peut recuperer les utilisateurs',
      });
    }

    let list = await this.users({
      where: {
        teamId: requester.teamId,
        deletedAt: null,
        role: userCreator.role === UserRole.ADMIN ? UserRole.CLIENT : undefined,
      },
    });

    if (userCreator.role === UserRole.CREATOR) {
      list = list.filter((u) => u.role != UserRole.CREATOR);
    }

    return {
      users: list.map(({ passwordHash, ...rest }) => rest),
      team: team as Team,
      total: list.length,
      page: 1,
      limit: 250,
      success: true,
    };
  }

  /**
   * Bonus — GET /auth/users/:id : Récupère un utilisateur à partir de son id
   */
  async findOneUserByTeam(dto: GetUserDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    team: Team;
    success: boolean;
  }> {
    const { id, requester } = dto;

    this.logger.log(`Message received USERS-GET-ONE: (${requester.sub})`);

    const userCreator = await this.checkUser(requester);
    const team = await this.prisma.team.findUnique({
      where: {
        id: userCreator.id,
      },
    });

    if (userCreator.role === UserRole.CLIENT) {
      throw new RpcException({
        statusCode: 403,
        message:
          'Seul les créateur/admin de la team peut recuperer de la sorte un utilisateur',
      });
    }

    const target = await this.user({ id });
    if (!target || target.deletedAt || target.teamId !== requester.teamId) {
      throw new RpcException({
        statusCode: 404,
        message: 'Utilisateur introuvable dans cette team',
      });
    }

    const { passwordHash: _omit, ...safeUser } = target;

    return {
      user: safeUser,
      team: team as Team,
      success: true,
    };
  }

  /**
   * Bonus — GET /auth/users/:id : Récupère un utilisateur à partir de son id
   */
  async updateUserByTeam(dto: UpdateUserDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    message: string;
  }> {
    const { id, username, password, accessPolicy, role, requester } = dto;

    this.logger.log(`Message received USERS-UPDATE: (${requester.sub})`);

    const userCreator = await this.checkUser(requester);

    if (userCreator.role === UserRole.CLIENT) {
      throw new RpcException({
        statusCode: 403,
        message:
          'Seul les créateur/admin de la team peut recuperer de la sorte un utilisateur',
      });
    }

    if (role === UserRole.CREATOR) {
      throw new RpcException({
        statusCode: 400,
        message: 'Le rôle CREATOR ne peut pas être attribué via cette méthode',
      });
    }

    if (id === requester.sub) {
      throw new RpcException({
        statusCode: 400,
        message:
          'Un utilisateur ne peut pas mettre à jour ses données de ce méthode',
      });
    }

    if (role === UserRole.ADMIN && userCreator.role == UserRole.ADMIN) {
      throw new RpcException({
        statusCode: 400,
        message: 'Un Admin ne peut pas modifier un autre admin',
      });
    }

    const target = await this.user({ id });
    if (!target || target.deletedAt || target.teamId !== requester.teamId) {
      throw new RpcException({
        statusCode: 404,
        message: 'Utilisateur introuvable dans cette team',
      });
    }

    if (target.role === UserRole.CREATOR) {
      throw new RpcException({
        statusCode: 400,
        message: 'Le créateur de la team ne peut pas être modifié ici.',
      });
    }

    const hashedPassword = password && (await bcrypt.hash(password, 10));

    const updated = await this.updateUser({
      where: {
        id,
      },
      data: {
        username: username ? username : undefined,
        passwordHash: password ? hashedPassword : undefined,
        role,
        accessPolicy: { ...accessPolicy },
      },
    });

    if (password) {
      await this.notificationService.send({
        type: 'PASSWORD_RECREATED',
        email: updated.email,
        payload: {
          temporaryPassword: password,
          userName: updated.username,
          changedAt: new Date().toDateString(),
        },
      });
    }

    const { passwordHash: _omit, ...safeUser } = updated;

    return {
      user: safeUser,
      message: "L'utilisateur a été mit à jour avec succès.",
    };
  }

  /**
   * DELETE /auth/users/:id — Supprime (soft-delete) un User de la Team.
   * Réservé au CREATOR. Le CREATOR ne peut pas se supprimer lui-même.
   */
  async deleteUserInTeam(dto: DeleteUserDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    success: boolean;
    deletedAt: string;
  }> {
    try {
      const { id, requester } = dto;

      this.logger.log(
        `Message received USERS-DELETE: (${requester.sub}), to-delete: (${id})`,
      );

      const userCreator = await this.checkUser(requester);

      if (userCreator.role === UserRole.CLIENT) {
        throw new RpcException({
          statusCode: 403,
          message:
            'Seul les créateur/admin de la team peut supprimer un utilisateur',
        });
      }

      const target = await this.user({ id });
      if (!target || target.deletedAt || target.teamId !== requester.teamId) {
        throw new RpcException({
          statusCode: 404,
          message: 'Utilisateur introuvable dans cette team',
        });
      }

      if (target.role === UserRole.CREATOR) {
        throw new RpcException({
          statusCode: 400,
          message: 'Le créateur de la team ne peut pas être supprimé',
        });
      }

      if (
        target.role === UserRole.ADMIN &&
        userCreator.role == UserRole.ADMIN
      ) {
        throw new RpcException({
          statusCode: 400,
          message: 'Un Admin ne peut pas supprimer un autre admin',
        });
      }

      const deleted = await this.deleteUser({ id });
      const { passwordHash: _omit, ...safeUser } = deleted;
      return {
        user: safeUser,
        success: true,
        deletedAt: String(deleted.deletedAt),
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`User deletion failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message:
          "Une erreur est survenue lors de la suppression de l'utilisateur",
      });
    }
  }

  /**
   * CHECKER /users : Fait un petit check sur utilisateur du AuthContext/requester
   */
  private async checkUser(requester: AuthContextDto) {
    const user = await this.user({ id: requester.sub });

    if (!user || user.deletedAt) {
      throw new RpcException({
        statusCode: 401,
        message: 'Utilisateur introuvable',
      });
    }

    if (user.status == UserStatus.UNAUTHENTICATED) {
      throw new RpcException({
        statusCode: 401,
        message: 'Veillez verifier votre email.',
      });
    }

    if (user.teamId != requester.teamId) {
      throw new RpcException({
        statusCode: 401,
        message: 'Votre Team est bloquante...',
      });
    }

    return user;
  }
}
