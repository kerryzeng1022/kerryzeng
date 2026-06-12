import combinationRules from "@/data/combination-rules.json";
import type { CombinationRule, DimensionScore } from "@/lib/types";

const rules = combinationRules as CombinationRule[];

function matches(condition: string, scores: DimensionScore[]) {
  const [dimension, band] = condition.split(":");
  const score = scores.find((item) => item.dimension === dimension);
  if (!score) return false;
  if (score.scoreBand === band) return true;
  return band === "high" && score.score >= 62;
}

export function matchCombinationRules(scores: DimensionScore[]) {
  return rules
    .map((rule) => ({
      rule,
      hits: rule.conditions.filter((condition) => matches(condition, scores))
        .length
    }))
    .filter((item) => item.hits >= 2)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 5)
    .map((item) => item.rule);
}
