// rules/evaluators/countryRule.ts
import type { RuleEvaluator } from '../../types/rule.type';

export const evalCountryBlacklist: RuleEvaluator = async (rule, input) => {
  const { countries } = rule.condition as { countries: string[] };
  return !!input.country && countries.includes(input.country);
};

export const evalCountryWhitelist: RuleEvaluator = async (rule, input) => {
  const { countries } = rule.condition as { countries: string[] };
  return !!input.country && countries.includes(input.country); // même lecture (a) que IP
};

export const evalContinentBlacklist: RuleEvaluator = async (rule, input) => {
  const { continents } = rule.condition as { continents: string[] };
  return !!input.continent && continents.includes(input.continent);
};
