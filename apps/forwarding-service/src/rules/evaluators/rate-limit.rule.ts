// rules/evaluators/rateLimitRule.ts
import type { RuleEvaluator } from '../../types/rule.type';

export const evalRateLimit: RuleEvaluator = async (rule, input) => {
  const { maxRequests, windowSeconds } = rule.condition as {
    maxRequests: number;
    windowSeconds: number;
  };
  const key = `rl:${input.serverId}:${input.ip}`;
  const count = await input.redis.incr(key);
  if (count === null) return false; // Redis KO → on ne bloque pas sur le rate-limit (fail-open)
  if (count === 1) await input.redis.expire(key, windowSeconds);
  return count > maxRequests;
};
