import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import {
  CreateServerDto,
  FindAllServersDto,
  FindOneServerDto,
  UpdateServerDto,
  TokenAuthServerDto,
  RevokeServerDto,
  GrantServerDto,
} from './server.dto';
import { AccessPolicyDto } from 'apps/user-service/src/user/dto/access-policy.dto';

@Injectable()
export class ServerService {
  private readonly logger = new Logger(ServerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServerDto) {
    try {
      const { requester, name, url, type } = dto;
      this.logger.log(`Message received SERVER-CREATE: (${requester.sub})`);

      const identifier = await this.generateUniqueIdentifier(name);

      const s = await this.prisma.server.create({
        data: {
          name,
          identifier,
          url: url ?? '',
          type: type ?? 'CLOUD',
          teamId: requester.teamId,
        },
      });
      return {
        server: s,
        message: 'Server créé avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Server-Create failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la création du serveur',
      });
    }
  }

  async findAll(dto: FindAllServersDto) {
    try {
      const { requester } = dto;
      this.logger.log(`Message received SERVER-FIND-ALL: (${requester.sub})`);

      const data = await this.prisma.server.findMany({
        where: { teamId: requester.teamId },
      });

      return {
        servers: data,
        total: data.length,
        page: 1,
        limit: 250,
        success: true,
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Server-FindAll failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la récupération des serveurs',
      });
    }
  }

  async findOne(dto: FindOneServerDto) {
    try {
      const { requester, id } = dto;
      this.logger.log(`Message received SERVER-FIND-ONE: (${id})`);

      const server = await this.prisma.server.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      const users = await this.prisma.user.findMany({
        where: {
          teamId: requester.teamId,
        },
      });

      const filtered = users.filter((u) => {
        const accessPolicy = u.accessPolicy as unknown as AccessPolicyDto;

        if (accessPolicy.serverIds.includes(server.id)) {
          return u;
        }
      });

      return {
        server,
        users: filtered.map((u) => ({ id: u.id, username: u.username })),
        message: 'Serveur récuperé avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Server-FindOne failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la récupération du serveur',
      });
    }
  }

  async update(dto: UpdateServerDto) {
    try {
      const { requester, id, ...data } = dto;
      this.logger.log(`Message received SERVER-UPDATE: (${id})`);

      const server = await this.prisma.server.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      const updated = await this.prisma.server.update({ where: { id }, data });

      return {
        server: updated,
        message: 'Server mis à jour avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Server-Update failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la mise à jour du serveur',
      });
    }
  }

  async remove(dto: FindOneServerDto) {
    try {
      const { requester, id } = dto;
      this.logger.log(`Message received SERVER-REMOVE: (${id})`);

      const server = await this.prisma.server.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      return await this.prisma.server.delete({ where: { id } });
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Server-Remove failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la suppression du serveur',
      });
    }
  }

  async toggleTokenAuth(dto: TokenAuthServerDto) {
    try {
      const { requester, id, requireToken } = dto;
      this.logger.log(`Message received SERVER-TOKEN-AUTH: (${id})`);

      const server = await this.prisma.server.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      const updated = await this.prisma.server.update({
        where: { id },
        data: { requireToken },
      });

      return {
        server: updated,
        message: requireToken
          ? 'Authentification activée sur ce Serveur.'
          : 'Authentification désactivée sur ce Serveur.',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `Server-TokenAuth failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la mise à jour du requireToken',
      });
    }
  }

  // STUB — logique de révocation à implémenter par la suite
  async revoke(dto: RevokeServerDto) {
    try {
      const { requester, id } = dto;
      this.logger.log(`Message received SERVER-REVOKE (stub): (${id})`);

      const server = await this.prisma.server.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      return server;
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Server-Revoke failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la révocation du serveur',
      });
    }
  }

  // STUB — logique de réattribution à implémenter par la suite
  async grant(dto: GrantServerDto) {
    try {
      const { requester, id } = dto;
      this.logger.log(`Message received SERVER-GRANT (stub): (${id})`);

      const server = await this.prisma.server.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      return server;
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Server-Grant failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la réattribution du serveur',
      });
    }
  }

  // ─── Helpers internes ──────────────────────────────────────────

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // retire les accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueIdentifier(name: string): Promise<string> {
    const base = this.slugify(name) || 'server';
    let identifier = base;
    let attempts = 0;

    while (await this.prisma.server.findUnique({ where: { identifier } })) {
      attempts += 1;
      identifier = `${base}-${crypto.randomBytes(3).toString('hex')}`;
      if (attempts > 5) break; // sécurité anti-boucle infinie
    }

    return identifier;
  }
}
