// rules/evaluators/ipRule.ts
import type { RuleEvaluator } from '../../types/rule.type';
import { isIpInRange } from '../../utils/rule.util';

export const evalIpBlacklist: RuleEvaluator = async (rule, input) => {
  const { values } = rule.condition as { values: string[] };
  return values.some((v) => isIpInRange(input.ip, v));
};

export const evalIpWhitelist: RuleEvaluator = async (rule, input) => {
  const { values } = rule.condition as { values: string[] };
  return !values.some((v) => isIpInRange(input.ip, v));
  // Note : "whitelist" ici veut dire "matches si PAS dans la liste" → à combiner
  // avec action=ALLOW côté config. Voir remarque sémantique plus bas.
};

