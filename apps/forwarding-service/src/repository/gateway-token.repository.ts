// repositories/GatewayTokenRepository.ts
import {
  RedisService,
  RedisUnavailableError,
} from '../infrastructure/redis.service';
import type { CachedGatewayToken } from '../types/server.type';

export type TokenValidationResult =
  | { status: 'valid'; token: CachedGatewayToken }
  | { status: 'invalid' } // absence de clé — révoqué, expiré, ou jamais existé
  | { status: 'unavailable' }; // Redis injoignable — pas la faute du client

export class GatewayTokenRepository {
  constructor(private redis: RedisService) {}

  async validate(bearer: string): Promise<TokenValidationResult> {
    try {
      const raw = await this.redis.get(`gw:${bearer}`);
      if (!raw) return { status: 'invalid' };
      return { status: 'valid', token: JSON.parse(raw) as CachedGatewayToken };
    } catch (err) {
      if (err instanceof RedisUnavailableError) {
        return { status: 'unavailable' };
      }
      throw err;
    }
  }
}
