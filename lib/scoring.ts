import { questionnaireData } from "@/lib/questionnaire";
import type { AnswerMap, DimensionScore, ScoreBand } from "@/lib/types";

export function scoreToBand(score: number): ScoreBand {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}

export function calculateScores(
  answers: AnswerMap,
  selectedQuestionIds?: string[]
): DimensionScore[] {
  const selectedIds = new Set(
    selectedQuestionIds?.length ? selectedQuestionIds : Object.keys(answers)
  );

  return questionnaireData.dimensions.map((dimension) => {
    const questions = questionnaireData.questions.filter(
      (question) => question.dimension === dimension.id && selectedIds.has(question.id)
    );
    if (!questions.length) {
      return {
        dimension: dimension.id,
        dimensionName: dimension.name,
        score: 50,
        scoreBand: scoreToBand(50)
      };
    }
    const rawTotal = questions.reduce((total, question) => {
      const answer = Number(answers[question.id] ?? 3);
      const normalized = question.reverse ? 6 - answer : answer;
      return total + normalized;
    }, 0);
    const min = questions.length;
    const max = questions.length * 5;
    const score = Math.round(((rawTotal - min) / (max - min)) * 100);

    return {
      dimension: dimension.id,
      dimensionName: dimension.name,
      score,
      scoreBand: scoreToBand(score)
    };
  });
}

export function getTopAndLow(scores: DimensionScore[]) {
  const ordered = [...scores].sort((a, b) => b.score - a.score);
  return {
    topDimensions: ordered.slice(0, 3),
    lowDimensions: ordered.slice(-3).reverse()
  };
}
