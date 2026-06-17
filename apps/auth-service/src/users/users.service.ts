import { Injectable } from '@nestjs/common';
import { Prisma, User } from '../generated/prisma-client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  // Injection du PrismaService via le constructeur
  constructor(private prisma: PrismaService) {}

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
}
