import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { Prisma, User, UserRole } from '../generated/prisma-client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  // Injection du PrismaService via le constructeur
  constructor(private prisma: PrismaService) {}

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
  // Méthodes spécifiques ajoutées pour /auth/users (message patterns)
  // ──────────────────────────────────────────────────────────────

  /**
   * POST /auth/users — Crée un User dans la Team du requester.
   * Réservé au CREATOR. Le rôle CREATOR ne peut pas être attribué ici.
   */
  async createUserInTeam(
    dto: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    try {
      const { username, email, password, role, requester } = dto;

      this.logger.log(
        `Message received on UsersService => CreateInTeam (${email})`,
      );

      if (requester.role === UserRole.CLIENT) {
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
        team: { connect: { id: requester.teamId } },
      });

      const { passwordHash: _omit, ...safeUser } = user;
      return safeUser;
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
   * DELETE /auth/users/:id — Supprime (soft-delete) un User de la Team.
   * Réservé au CREATOR. Le CREATOR ne peut pas se supprimer lui-même.
   */
  async deleteUserInTeam(
    dto: DeleteUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    try {
      const { id, requester } = dto;

      this.logger.log(
        `Message received on UsersService => DeleteInTeam (${id})`,
      );

      if (requester.role === UserRole.CLIENT) {
        throw new RpcException({
          statusCode: 403,
          message:
            'Seul les créateur/admin de la team peut supprimer un utilisateur',
        });
      }

      const target = await this.user({ id });
      if (!target || target.teamId !== requester.teamId) {
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

      const deleted = await this.deleteUser({ id });
      const { passwordHash: _omit, ...safeUser } = deleted;
      return safeUser;
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
   * Bonus — GET /auth/users : liste les Users actifs de la Team du requester.
   */
  async findUsersByTeam(teamId: string): Promise<Omit<User, 'passwordHash'>[]> {
    const list = await this.users({ where: { teamId, deletedAt: undefined } });
    return list.map(({ passwordHash, ...rest }) => rest);
  }
}
