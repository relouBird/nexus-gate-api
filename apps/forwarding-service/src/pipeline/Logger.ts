// pipeline/Logger.ts

import { LogQueue } from '../types/logger.type';
import { Middleware } from '../types/middleware.type';

export const logRequest =
  (queue: LogQueue): Middleware =>
  async (ctx) => {
    queue.push({
      serverId: ctx.server?.id ?? 'unknown',
      timestamp: new Date(),
      clientIp: ctx.ip,
      method: ctx.method,
      path: ctx.route.subPath,
      statusCode: ctx.status,
      latencyMs: Date.now() - ctx.startedAt,
      gatewayTokenId: ctx.gatewayToken?.id ?? null,
      via: ctx.server?.type === 'LOCAL' ? 'tunnel' : 'cloud',
    });
  };
