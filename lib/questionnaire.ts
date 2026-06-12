import questionnaire from "@/data/questionnaire.json";
import type { Question, Questionnaire } from "@/lib/types";

export const questionnaireData = questionnaire as Questionnaire;

export const dimensions = questionnaireData.dimensions;

export const QUESTIONNAIRE_SAMPLE_SIZE = 76;

export const questionTargetsByDimension = new Map(
  dimensions.map((dimension, index) => [dimension.id, index < 6 ? 6 : 5])
);

export const responseScales = {
  agreement: [
    { value: 5, label: "非常同意" },
    { value: 4, label: "比较同意" },
    { value: 3, label: "说不清" },
    { value: 2, label: "不太同意" },
    { value: 1, label: "非常不同意" }
  ],
  action: [
    { value: 5, label: "肯定会" },
    { value: 4, label: "大概率会" },
    { value: 3, label: "说不清" },
    { value: 2, label: "大概率不会" },
    { value: 1, label: "肯定不会" }
  ],
  feeling: [
    { value: 5, label: "非常会" },
    { value: 4, label: "比较会" },
    { value: 3, label: "说不清" },
    { value: 2, label: "不太会" },
    { value: 1, label: "完全不会" }
  ],
  choiceAB: [
    { value: 1, label: "一定选A" },
    { value: 2, label: "可能选A" },
    { value: 3, label: "不太确定" },
    { value: 4, label: "可能选B" },
    { value: 5, label: "一定选B" }
  ]
} as const;

export function getResponseScale(question: Question) {
  return responseScales[question.responseMode ?? "agreement"];
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function hasThreeSameDimensionsInARow(questions: Question[]) {
  return questions.some((question, index) => {
    if (index < 2) return false;
    return (
      question.dimension === questions[index - 1].dimension &&
      question.dimension === questions[index - 2].dimension
    );
  });
}

function spreadQuestions(questions: Question[]) {
  const remaining = new Map<string, Question[]>();
  const ordered: Question[] = [];

  for (const question of shuffle(questions)) {
    const group = remaining.get(question.dimension) ?? [];
    group.push(question);
    remaining.set(question.dimension, group);
  }

  while (ordered.length < questions.length) {
    const lastTwo = ordered.slice(-2);
    const candidates = [...remaining.entries()]
      .filter(([, group]) => group.length > 0)
      .filter(([dimension]) => {
        return !(
          lastTwo.length === 2 &&
          lastTwo[0].dimension === dimension &&
          lastTwo[1].dimension === dimension
        );
      })
      .sort(([, leftGroup], [, rightGroup]) => rightGroup.length - leftGroup.length);

    const picked =
      candidates[0] ?? [...remaining.entries()].find(([, value]) => value.length > 0);
    if (!picked) break;

    const [, group] = picked;
    if (!group.length) break;

    ordered.push(group.pop() as Question);
  }

  return hasThreeSameDimensionsInARow(ordered) ? shuffle(questions) : ordered;
}

export function selectQuestionSet() {
  const selected = dimensions.flatMap((dimension) => {
    const target = questionTargetsByDimension.get(dimension.id) ?? 5;
    const pool = questionnaireData.questions.filter(
      (question) => question.dimension === dimension.id
    );
    return shuffle(pool).slice(0, target);
  });

  return spreadQuestions(selected);
}

export function getQuestionsByIds(questionIds: string[]) {
  const byId = new Map(questionnaireData.questions.map((question) => [question.id, question]));
  return questionIds
    .map((questionId) => byId.get(questionId))
    .filter((question): question is Question => Boolean(question));
}
