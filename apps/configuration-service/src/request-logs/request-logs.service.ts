import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { canUserAccess, AccessPolicy } from '../utils/policy.util';
import { GetLogsDto } from './request-logs.dto';
import {
  LOGS_DEFAULT_LIMIT,
  LOGS_DEFAULT_PAGE,
  LOGS_MAX_LIMIT,
} from './request-logs.constants';

@Injectable()
export class RequestLogsService {
  private readonly logger = new Logger(RequestLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: GetLogsDto) {
    try {
      const { requester, serverIds, method, via, statusCode, from, to } = dto;

      this.logger.log(`LOGS-FIND-ALL: (${requester.sub})`);

      // ─── Pagination ────────────────────────────────────────────────

      const page = this.parsePage(dto.page);
      const limit = this.parseLimit(dto.limit);
      const skip = (page - 1) * limit;

      // ─── Résolution des serverIds autorisés ───────────────────────
      // On part toujours de l'ensemble des serveurs de la team
      // puis on filtre selon l'accessPolicy de l'utilisateur.

      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: requester.sub },
      });
      const policy = user.accessPolicy as unknown as AccessPolicy;

      const allTeamServers = await this.prisma.server.findMany({
        where: { teamId: requester.teamId },
        select: { id: true },
      });

      // Serveurs auxquels l'utilisateur a accès selon sa policy
      const accessibleIds = allTeamServers
        .filter((s) => canUserAccess(policy, s.id))
        .map((s) => s.id);

      // Si serverIds fournis → intersection avec les accessibles
      // Si serverIds absents ou vides → tous les accessibles
      let resolvedServerIds: string[];
      if (serverIds && serverIds.length > 0) {
        resolvedServerIds = serverIds.filter((id) =>
          accessibleIds.includes(id),
        );

        // Si l'utilisateur demande des serveurs auxquels il n'a pas accès
        // on signale explicitement les refusés
        const disallowed = serverIds.filter(
          (id) => !accessibleIds.includes(id),
        );
        if (disallowed.length > 0) {
          throw new RpcException({
            statusCode: 403,
            message: `Accès refusé pour les serveurs : ${disallowed.join(', ')}`,
          });
        }
      } else {
        resolvedServerIds = accessibleIds;
      }

      // Si l'utilisateur n'a accès à aucun serveur
      if (resolvedServerIds.length === 0) {
        return this.emptyResponse(page, limit);
      }

      // ─── Construction du filtre Prisma ────────────────────────────

      const where: any = {
        serverId: { in: resolvedServerIds },
      };

      if (method) {
        where.method = method.toUpperCase();
      }

      if (via) {
        where.via = via;
      }

      if (statusCode) {
        where.statusCode = Number(statusCode);
      }

      if (from || to) {
        where.timestamp = {};
        if (from) {
          const parsedFrom = new Date(from);
          if (isNaN(parsedFrom.getTime())) {
            throw new RpcException({
              statusCode: 400,
              message: 'Paramètre "from" invalide',
            });
          }
          where.timestamp.gte = parsedFrom;
        }
        if (to) {
          const parsedTo = new Date(to);
          if (isNaN(parsedTo.getTime())) {
            throw new RpcException({
              statusCode: 400,
              message: 'Paramètre "to" invalide',
            });
          }
          where.timestamp.lte = parsedTo;
        }
      }

      // ─── Requête DB ───────────────────────────────────────────────

      const [logs, total] = await Promise.all([
        this.prisma.requestLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { timestamp: 'desc' }, // plus récent en premier
        }),
        this.prisma.requestLog.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: logs,
        pagination: {
          total,
          page,
          limit,
          pages: totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        filters: {
          serverIds: resolvedServerIds,
          method: method?.toUpperCase() ?? null,
          via: via ?? null,
          statusCode: statusCode ? Number(statusCode) : null,
          from: from ?? null,
          to: to ?? null,
        },
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`LOGS-FIND-ALL failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la récupération des logs',
      });
    }
  }

  // ─── Helpers privés ───────────────────────────────────────────────────────

  private parsePage(raw?: number | string): number {
    if (raw === undefined || raw === null) return LOGS_DEFAULT_PAGE;
    const parsed = parseInt(String(raw), 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new RpcException({
        statusCode: 400,
        message: 'Le paramètre "page" doit être un entier supérieur à 0',
      });
    }
    return parsed;
  }

  private parseLimit(raw?: number | string): number {
    if (raw === undefined || raw === null) return LOGS_DEFAULT_LIMIT;
    const parsed = parseInt(String(raw), 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new RpcException({
        statusCode: 400,
        message: 'Le paramètre "limit" doit être un entier supérieur à 0',
      });
    }
    if (parsed > LOGS_MAX_LIMIT) {
      throw new RpcException({
        statusCode: 400,
        message: `Le paramètre "limit" ne peut pas dépasser ${LOGS_MAX_LIMIT}`,
      });
    }
    return parsed;
  }

  private emptyResponse(page: number, limit: number) {
    return {
      success: true,
      data: [],
      pagination: {
        total: 0,
        page,
        limit,
        pages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      filters: {},
    };
  }
}
