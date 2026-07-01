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
  HeaderServerDto,
} from './server.dto';
import { AccessPolicyDto } from 'apps/user-service/src/user/dto/access-policy.dto';
import { RedisService } from '../redis/redis.service';
import {
  AccessPolicy,
  canUserAccess,
  policyAfterGrant,
  policyAfterRevoke,
} from '../utils/policy.util';
import { GatewayTokenServer } from '../generated/prisma-client';

export type GatewayTokenSAdd = {
  gatewayToken: {
    id: string;
    value: string;
  };
} & GatewayTokenServer;

@Injectable()
export class ServerService {
  private readonly logger = new Logger(ServerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateServerDto) {
    try {
      const { requester, name, url, type } = dto;
      this.logger.log(`Message received SERVER-CREATE: (${requester.sub})`);

      const identifier = await this.generateUniqueIdentifier(name);

      // 1. Serveurs existants avant création (pour détecter les tokens "illimités")
      const existingServers = await this.prisma.server.findMany({
        where: { teamId: requester.teamId },
        select: { id: true },
      });
      const existingIds = existingServers.map((s) => s.id);

      // 2. Créer le serveur
      const server = await this.prisma.server.create({
        data: {
          name,
          identifier,
          url: url ?? '',
          type: type ?? 'CLOUD',
          teamId: requester.teamId,
        },
      });

      // 3. Trouver les tokens "illimités" = scope couvre exactement tous les serveurs existants
      if (existingIds.length > 0) {
        const candidates = await this.prisma.gatewayToken.findMany({
          where: { teamId: requester.teamId, revoked: false },
          include: { scope: true },
        });

        const unlimitedTokens = candidates.filter((t) => {
          if (t.scope.length !== existingIds.length) return false;
          const tokenServerIds = t.scope.map((s) => s.serverId);
          return existingIds.every((id) => tokenServerIds.includes(id));
        });

        if (unlimitedTokens.length > 0) {
          // 4. Ajouter le nouveau serveur à leur scope
          await this.prisma.gatewayTokenServer.createMany({
            data: unlimitedTokens.map((t) => ({
              gatewayTokenId: t.id,
              serverId: server.id,
            })),
          });

          // 5. Invalider leur cache Redis (Forwarding re-lira depuis DB au prochain hit)
          for (const token of unlimitedTokens) {
            await this.redis.del(`gw:${token.value}`);
          }
        }
      }
      return {
        server,
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

      // 1. Mettre à jour l'accessPolicy de tous les users qui avaient accès
      const users = await this.prisma.user.findMany({
        where: { teamId: requester.teamId },
      });
      for (const user of users) {
        const policy = user.accessPolicy as unknown as AccessPolicy;
        if (!canUserAccess(policy, id)) continue;
        await this.prisma.user.update({
          where: { id: user.id },
          data: { accessPolicy: policyAfterRevoke(policy, id) },
        });
      }

      // 2. Récupérer toutes les jointures obseletes et les supprimer.
      const joins = await this.deleteObseleteJoin(server.id);

      // 3. Pour chaque token affecté : vérifier s'il est orphelin → révoquer + invalider Redis
      await this.invalidateFromGatewayTokenIds(joins);

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

  async setHeader(dto: HeaderServerDto) {
    try {
      const { requester, id, headers } = dto;
      this.logger.log(`Message received SERVER-SET-HEADER: (${id})`);

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
        data: { headers },
      });

      return {
        server: updated,
        message: 'Entête mit à jour sur ce Serveur.',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `Server-SET-HEADER failed: ${error.message}`,
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

      // 1. Mettre à jour l'accessPolicy de tous les users qui avaient accès
      const users = await this.prisma.user.findMany({
        where: { teamId: requester.teamId },
      });
      for (const user of users) {
        const policy = user.accessPolicy as unknown as AccessPolicy;
        if (!canUserAccess(policy, id)) continue;
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            accessPolicy: policyAfterRevoke(policy, id),
          },
        });
      }

      // 2. Récupérer toutes les jointures obselete et les supprimer.
      const joins = await this.deleteObseleteJoin(server.id);

      // 3. Pour chaque token affecté : vérifier s'il est orphelin → révoquer + invalider Redis
      await this.invalidateFromGatewayTokenIds(joins);

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
      const { requester, id, userIds } = dto;
      this.logger.log(`Message received SERVER-GRANT (stub): (${id})`);

      const server = await this.prisma.server.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      const allUsers = await this.prisma.user.findMany({
        where: { teamId: requester.teamId },
      });

      // Delta entre l'état actuel et la liste finale entrante
      const currentIds = allUsers
        .filter((u) =>
          canUserAccess(u.accessPolicy as unknown as AccessPolicy, id),
        )
        .map((u) => u.id);

      const toRevoke = currentIds.filter((uid) => !userIds.includes(uid));
      const toGrant = userIds.filter((uid) => !currentIds.includes(uid));
      // intersection → rien à faire

      // Retrait d'accès
      for (const userId of toRevoke) {
        const user = allUsers.find((u) => u.id === userId)!;
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            accessPolicy: policyAfterRevoke(
              user.accessPolicy as unknown as AccessPolicy,
              id,
            ),
          },
        });
      }

      // 2. Récupérer toutes les jointures obselete et les supprimer.
      const joins = await this.deleteObseleteJoin(server.id, toRevoke);

      // 3. Pour chaque token affecté : vérifier s'il est orphelin → révoquer + invalider Redis
      await this.invalidateFromGatewayTokenIds(joins);

      // Ajout d'accès
      for (const userId of toGrant) {
        const user = allUsers.find((u) => u.id === userId)!;
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            accessPolicy: policyAfterGrant(
              user.accessPolicy as unknown as AccessPolicy,
              id,
            ),
          },
        });
      }

      return {
        server,
        users: allUsers
          .filter((u) => userIds.includes(u.id))
          .map((u) => ({ id: u.id, username: u.username })),
        message: 'Accès serveur mit à jour avec succès...',
      };
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

  private async invalidateFromGatewayTokenIds(tokenIds: GatewayTokenSAdd[]) {
    // 4. Pour chaque token affecté : vérifier s'il est orphelin → révoquer + invalider Redis
    const affectedTokenIds = [
      ...new Set(tokenIds.map((j) => j.gatewayTokenId)),
    ];
    for (const tokenId of affectedTokenIds) {
      const token = tokenIds.find(
        (j) => j.gatewayTokenId === tokenId,
      )!.gatewayToken;
      const remaining = await this.prisma.gatewayTokenServer.count({
        where: { gatewayTokenId: tokenId },
      });
      if (remaining === 0) {
        await this.prisma.gatewayToken.update({
          where: { id: tokenId },
          data: { revoked: true },
        });
      }
      await this.redis.del(`gw:${token.value}`);
    }
  }

  private async deleteObseleteJoin(serverId: string, userIds?: string[]) {
    const joins =
      userIds && userIds.length != 0
        ? await this.prisma.gatewayTokenServer.findMany({
            where: {
              serverId,
              gatewayToken: {
                userId: {
                  in: userIds,
                },
              },
            },
            include: { gatewayToken: { select: { id: true, value: true } } },
          })
        : await this.prisma.gatewayTokenServer.findMany({
            where: { serverId },
            include: { gatewayToken: { select: { id: true, value: true } } },
          });

    // 3. Supprimer toutes ces jointures
    await this.prisma.gatewayTokenServer.deleteMany({
      where: { serverId },
    });

    return joins;
  }
}
