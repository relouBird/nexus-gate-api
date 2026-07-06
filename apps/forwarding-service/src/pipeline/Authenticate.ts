// pipeline/Authenticate.ts
import type { Middleware } from '../types/middleware.type';
import type { GatewayTokenRepository } from '../repository/gateway-token.repository';
import { HttpError } from '../server/handleError';

export const authenticate =
  (repo: GatewayTokenRepository): Middleware =>
  async (ctx) => {
    if (!ctx.server!.requireToken) return; // Porte 1 non requise pour ce serveur

    const authHeader = ctx.headers['authorization'];
    const bearer = authHeader?.split(' ')[1];
    if (!bearer) throw new HttpError(401, 'Token manquant');

    const result = await repo.validate(bearer);

    switch (result.status) {
      case 'invalid':
        throw new HttpError(401, 'Token invalide ou expiré');
      case 'unavailable':
        throw new HttpError(503, 'Service temporairement indisponible');
      case 'valid':
        if (!result.token.scopeServerIds.includes(ctx.server!.id)) {
          throw new HttpError(403, 'Accès refusé à ce serveur');
        }
        ctx.gatewayToken = result.token;
        return;
    }
  };
