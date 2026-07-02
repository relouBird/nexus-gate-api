import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import {
  CreateGatewayTokenDto,
  FindAllGatewayTokensDto,
  RemoveGatewayTokenDto,
} from './token.dto';
import { AccessPolicy, canUserAccess } from '../utils/policy.util';
import { RedisService } from '../redis/redis.service';

const DEFAULT_TTL = 30 * 24 * 60 * 60; // 30 jours en secondes

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateGatewayTokenDto) {
    try {
      const { requester, name, scope, expiresAt } = dto;
      this.logger.log(
        `Message received GATEWAY-TOKEN-CREATE: (${requester.sub})`,
      );

      // 1. Récupérer l'accessPolicy du créateur
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: requester.sub },
      });
      const policy = user.accessPolicy as unknown as AccessPolicy;

      // 2. Résoudre les serverIds du scope
      let scopeServerIds: string[];

      if (!scope || scope.length === 0) {
        // Pas de restriction → tous les serveurs accessibles par cet utilisateur
        const allServers = await this.prisma.server.findMany({
          where: { teamId: requester.teamId },
          select: { id: true },
        });
        scopeServerIds = allServers
          .filter((s) => canUserAccess(policy, s.id))
          .map((s) => s.id);
      } else {
        // Scope explicite → on valide chaque serverId contre la policy
        const disallowed = scope.filter((sid) => !canUserAccess(policy, sid));
        if (disallowed.length > 0) {
          throw new RpcException({
            statusCode: 403,
            message: `Accès refusé pour les serveurs : ${disallowed.join(', ')}`,
          });
        }
        scopeServerIds = scope;
      }

      // 3. Calculer le TTL Redis
      let ttl = DEFAULT_TTL;
      if (expiresAt) {
        ttl = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
        if (ttl <= 0)
          throw new RpcException({
            statusCode: 400,
            message: "Date d'expiration invalide",
          });
      }

      // 4. Générer la valeur du token
      const value = `gw_${randomBytes(24).toString('hex')}`;

      // 5. Créer en DB (token + jointures scope)
      const token = await this.prisma.gatewayToken.create({
        data: {
          name,
          value,
          userId: requester.sub,
          teamId: requester.teamId,
          scope:
            scope && scope.length
              ? { create: scope.map((serverId) => ({ serverId })) }
              : undefined,
        },
        include: { scope: true },
      });

      // 6. Stocker en Redis pour validation rapide par le Forwarding Service
      await this.redis.set(
        `gw:${value}`,
        JSON.stringify({
          id: token.id,
          teamId: token.teamId,
          userId: token.userId,
          scopeServerIds,
        }),
        ttl,
      );

      return { token, message: 'Token API créé avec Succès...' };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `GatewayToken-Create failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la création du token',
      });
    }
  }

  async findAll(dto: FindAllGatewayTokensDto) {
    try {
      const { requester } = dto;
      this.logger.log(
        `Message received GATEWAY-TOKEN-FIND-ALL: (${requester.sub})`,
      );

      const tokens = await this.prisma.gatewayToken.findMany({
        where: { teamId: requester.teamId },
        include: { scope: true },
      });

      return {
        tokens,
        total: tokens.length,
        message: 'Vos Tokens recuperés avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `GatewayToken-FindAll failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la récupération des tokens',
      });
    }
  }

  async remove(dto: RemoveGatewayTokenDto) {
    try {
      const { requester, id } = dto;
      this.logger.log(`Message received GATEWAY-TOKEN-REMOVE: (${id})`);

      const token = await this.prisma.gatewayToken.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!token)
        throw new RpcException({
          statusCode: 404,
          message: 'Token introuvable',
        });

      // Flag cosmétique pour l'instant, comme demandé
      const deleted = await this.prisma.gatewayToken.update({
        where: { id },
        data: { revoked: true },
      });
      await this.redis.del(`gw:${token.value}`);

      return {
        token: deleted,
        message: 'Token supprimé avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `GatewayToken-Remove failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la révocation du token',
      });
    }
  }
}
