// rules/types.ts
import type { RuleConfig } from './server.type';
import type { RedisService } from '../infrastructure/redis.service';

export type GeoInfoIp = {
  country?: string; // ISO 3166-1 alpha-2
  country_name?: string;
  continent?: string; // code zone
  continent_name?: string;
  phone?: string[];
  capital?: string;
  currency?: string[];
  languages?: string[];
};

export interface RuleEvalInput {
  ip: string;
  country?: string;
  continent?: string;
  userAgent?: string;
  path: string;
  redis: RedisService;
  serverId: string;
}

export type RuleEvaluator = (
  rule: RuleConfig,
  input: RuleEvalInput,
) => Promise<boolean>;
