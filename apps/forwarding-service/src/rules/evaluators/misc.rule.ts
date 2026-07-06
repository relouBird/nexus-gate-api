// rules/evaluators/miscRules.ts
import type { RuleEvaluator } from '../../types/rule.type';

export const evalUserAgentBlock: RuleEvaluator = async (rule, input) => {
  const { patterns } = rule.condition as { patterns: string[] };
  if (!input.userAgent) return false;
  const ua = input.userAgent.toLowerCase();
  return patterns.some((p) => ua.includes(p.toLowerCase()));
};

export const evalPathBlock: RuleEvaluator = async (rule, input) => {
  const { paths } = rule.condition as { paths: string[] };
  return paths.some((p) => input.path.startsWith(p));
};

export const evalTorBlock: RuleEvaluator = async (rule, input) => {
  // Nécessite une liste d'IP de sortie Tor (ex: table Redis alimentée périodiquement
  // depuis https://check.torproject.org/torbulkexitlist). Non implémenté ici — stub.
  return false;
};

export const evalReputationBlock: RuleEvaluator = async (rule, input) => {
  // Nécessite un appel AbuseIPDB. Non implémenté ici — stub, cf. note plus bas.
  return false;
};
