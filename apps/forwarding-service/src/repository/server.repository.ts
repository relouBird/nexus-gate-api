// repositories/ServerRepository.ts
import {
  RedisService,
  RedisUnavailableError,
} from '../infrastructure/redis.service';
import { PrismaService } from '../infrastructure/prisma.service';
import type { ServerConfig, RuleConfig } from '../types/server.type';

const SERVER_CONFIG_TTL = 30; // secondes, conforme §12 de la doc

export class ServerRepository {
  constructor(
    private redis: RedisService,
    private db: PrismaService,
  ) {}

  /**
   * Résout teamSlug + serverIdentifier → ServerConfig complet.
   * Une seule clé de cache "server-config:{teamSlug}:{identifier}" (choix simple,
   * cf. discussion précédente — pas de clé "resolve:" séparée pour l'instant).
   */
  async resolve(
    serverIdentifier: string,
  ): Promise<ServerConfig | null> {
    const cacheKey = `server-config:${serverIdentifier}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as ServerConfig;
    } catch (err) {
      if (err instanceof RedisUnavailableError) {
        // Dégradé : Redis KO → on continue vers la DB plutôt que de bloquer.
        // Contrairement à gw:{value}, une panne Redis ici ne doit pas priver
        // tout le monde d'accès — c'est juste plus lent.
        console.error(
          '[ServerRepository] Redis unavailable, falling back to DB',
        );
      } else {
        throw err;
      }
    }

    const server = await this.db.server.findFirst({
      where: { identifier: serverIdentifier },
      include: { rules: { where: { isActive: true } } },
    });

    if (!server) return null;

    const config: ServerConfig = {
      id: server.id,
      teamId: server.teamId,
      type: server.type,
      url: server.url,
      requireToken: server.requireToken,
      headers: server.headers as Record<string, string>,
      rules: server.rules.map(
        (r): RuleConfig => ({
          id: r.id,
          type: r.type,
          condition: r.condition as Record<string, unknown>,
          action: r.action,
          priority: r.priority,
        }),
      ),
    };

    // best-effort, ne bloque pas la réponse si le SET échoue
    await this.redis.set(cacheKey, JSON.stringify(config), SERVER_CONFIG_TTL);

    return config;
  }

  /**
   * Utilisé pour invalider directement par id depuis le Config Service
   * si jamais on a besoin de recalculer sans repasser par teamSlug/identifier.
   * (Le Config Service connaît déjà teamSlug+identifier en pratique — cf. note plus bas.)
   */
  async getById(serverId: string): Promise<ServerConfig | null> {
    const server = await this.db.server.findUnique({
      where: { id: serverId },
      include: {
        rules: { where: { isActive: true } },
        team: { select: { slug: true } },
      },
    });
    if (!server) return null;

    return {
      id: server.id,
      teamId: server.teamId,
      type: server.type,
      url: server.url,
      requireToken: server.requireToken,
      headers: server.headers as Record<string, string>,
      rules: server.rules.map(
        (r): RuleConfig => ({
          id: r.id,
          type: r.type,
          condition: r.condition as Record<string, unknown>,
          action: r.action,
          priority: r.priority,
        }),
      ),
    };
  }
}
