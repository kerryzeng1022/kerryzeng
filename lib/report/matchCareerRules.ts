import careerRules from "@/data/career-rules.json";
import type { CareerRule, DimensionScore } from "@/lib/types";

const rules = careerRules as CareerRule[];

function conditionScore(condition: string, scores: DimensionScore[]) {
  const [dimension, band] = condition.split(":");
  const score = scores.find((item) => item.dimension === dimension);
  if (!score) return 0;
  if (score.scoreBand === band) return 1;
  if (band === "high") return score.score >= 55 ? 0.5 : 0;
  if (band === "low") return score.score <= 55 ? 0.5 : 0;
  return score.score >= 35 && score.score <= 75 ? 0.5 : 0;
}

export function matchCareerRules(scores: DimensionScore[]) {
  return rules
    .map((rule) => {
      const total = rule.conditions.reduce(
        (sum, condition) => sum + conditionScore(condition, scores),
        0
      );
      const matchScore = Math.round((total / rule.conditions.length) * 100);
      return { ...rule, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}
