// pipeline/EvaluateRules.ts
import type { Middleware } from '../types/middleware.type';
import type { RedisService } from '../infrastructure/redis.service';
import { runRules } from '../rules/RuleEngine';
import { HttpError } from '../server/handleError';
import { geoLookup } from '../infrastructure/geoLookup'; // MaxMind, cf. note

export const evaluateRules =
  (redis: RedisService): Middleware =>
  async (ctx) => {
    if (!ctx.server!.rules.length) return; // rien à évaluer

    const geo = geoLookup(ctx.ip);
    ctx.geo = geo;

    const matched = await runRules(ctx.server!.rules, {
      ip: ctx.ip,
      country: geo?.country,
      continent: geo?.continent,
      userAgent: ctx.headers['user-agent'],
      path: ctx.route.subPath,
      serverId: ctx.server!.id,
      redis,
    });

    if (!matched) return;

    switch (matched.action) {
      case 'DENY':
        throw new HttpError(
          403,
          'Access denied by rule :' + matched.type.toLocaleUpperCase(),
        );
      case 'CHALLENGE':
        throw new HttpError(429, 'Rate limit exceeded');
      case 'REDIRECT':
        ctx.responded = true;
        ctx.res.cork(() => {
          ctx.res.writeStatus('302');
          ctx.res.writeHeader('Location', '/blocked');
          ctx.res.end();
        });
        return;
      case 'LOG':
        console.log(`[RuleEngine] LOG match: rule=${matched.id} ip=${ctx.ip}`);
        return; // ne bloque pas, le pipeline continue
      case 'ALLOW':
        return; // court-circuite les règles suivantes mais laisse continuer le pipeline
    }
  };
