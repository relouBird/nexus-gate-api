// rules/RuleEngine.ts
import type { RuleConfig } from '../types/server.type';
import type { RuleEvalInput, RuleEvaluator } from '../types/rule.type';
// REGLE POUR -- IP
import { evalIpBlacklist, evalIpWhitelist } from './evaluators/ip.rule';

// REGLE POUR -- PAYS / CONTINENT
import { evalCountryBlacklist, evalCountryWhitelist, evalContinentBlacklist } from './evaluators/country.rule';

// REGLE POUR -- LIMITE D'ACCES (RATE LIMIT)
import { evalRateLimit } from './evaluators/rate-limit.rule';

// REGLE POUR -- AUTRES (USER AGENT, PATH, TOR, REPUTATION)
import { evalUserAgentBlock, evalPathBlock, evalTorBlock, evalReputationBlock } from './evaluators/misc.rule';

const evaluators: Record<string, RuleEvaluator> = {
  IP_BLACKLIST: evalIpBlacklist,
  IP_WHITELIST: evalIpWhitelist,
  COUNTRY_BLACKLIST: evalCountryBlacklist,
  COUNTRY_WHITELIST: evalCountryWhitelist,
  CONTINENT_BLACKLIST: evalContinentBlacklist,
  RATE_LIMIT: evalRateLimit,
  USER_AGENT_BLOCK: evalUserAgentBlock,
  PATH_BLOCK: evalPathBlock,
  TOR_BLOCK: evalTorBlock,
  REPUTATION_BLOCK: evalReputationBlock,
};

export async function runRules(rules: RuleConfig[], input: RuleEvalInput): Promise<RuleConfig | null> {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);
  for (const rule of sorted) {
    const evaluator = evaluators[rule.type];
    if (!evaluator) continue; // type inconnu → ignoré, pas de crash
    const matches = await evaluator(rule, input);
    if (matches) return rule;
  }
  return null;
}