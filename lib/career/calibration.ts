import type {
  AnswerMap,
  CareerCalibrationProfile,
  CareerCalibrationQuestion
} from "@/lib/types";

export const careerCalibrationQuestions: CareerCalibrationQuestion[] = [
  { id: "ci_01", kind: "interest", text: "我愿意长期理解健康、疾病预防或照护相关知识。", tags: ["health", "care"] },
  { id: "ci_02", kind: "interest", text: "我会主动关注法律规则、公共政策或社会公平问题。", tags: ["law", "public_service"] },
  { id: "ci_03", kind: "interest", text: "面对突发事件、安全风险或现场问题，我愿意成为处理问题的人。", tags: ["safety", "public_service"] },
  { id: "ci_04", kind: "interest", text: "我对产品、技术、工程或“东西是怎么造出来的”有持续兴趣。", tags: ["tech", "operations"] },
  { id: "ci_05", kind: "interest", text: "我享受研究数据、证据和复杂问题，并形成自己的判断。", tags: ["science", "finance"] },
  { id: "ci_06", kind: "interest", text: "我愿意通过沟通、谈判或服务帮助客户作出决定。", tags: ["business", "service"] },
  { id: "ci_07", kind: "interest", text: "我愿意教会别人、支持他人成长，或改善一个群体的处境。", tags: ["education", "care"] },
  { id: "ci_08", kind: "interest", text: "我对表达、内容、视觉、文化或创造新体验有持续兴趣。", tags: ["creative", "service"] },
  { id: "cc_01", kind: "capability", text: "过去一年，我曾耐心照顾、安抚或支持处在困难中的人。", tags: ["care"] },
  { id: "cc_02", kind: "capability", text: "过去一年，我曾用证据、规则或清晰表达说服别人接受一个判断。", tags: ["argument"] },
  { id: "cc_03", kind: "capability", text: "遇到突发状况时，我通常能保持冷静并迅速采取行动。", tags: ["crisis"] },
  { id: "cc_04", kind: "capability", text: "过去一年，我曾成功推进销售、谈判、合作或资源争取。", tags: ["persuasion"] },
  { id: "cc_05", kind: "capability", text: "我能把复杂技术、工具或流程学会，并做出可用成果。", tags: ["technical"] },
  { id: "cc_06", kind: "capability", text: "我能从大量信息中找出规律，并形成有依据的结论。", tags: ["analysis"] },
  { id: "cc_07", kind: "capability", text: "我能把知识讲清楚，让不同基础的人理解并行动。", tags: ["teaching"] },
  { id: "cc_08", kind: "capability", text: "我能持续产出文字、视觉、方案或其他原创作品。", tags: ["creative"] },
  { id: "ce_01", kind: "entry", text: "为了真正适合的职业，我可以接受三年以上的系统学习或训练。", tags: ["long_training"] },
  { id: "ce_02", kind: "entry", text: "如果职业需要，我愿意准备并参加严格的资格考试。", tags: ["licensing"] },
  { id: "ce_03", kind: "entry", text: "我可以接受从初级岗位重新开始，用时间换取长期专业壁垒。", tags: ["junior_restart"] },
  { id: "ce_04", kind: "entry", text: "我愿意持续积累作品、案例或证据，而不是只依赖学历和头衔。", tags: ["portfolio"] },
  { id: "cw_01", kind: "condition", text: "我能接受轮班、值班或工作时间不完全固定。", tags: ["shifts"] },
  { id: "cw_02", kind: "condition", text: "在明确训练和保护下，我能接受一定的现场、体力或安全风险。", tags: ["risk_public"] },
  { id: "cw_03", kind: "condition", text: "我愿意长期面对公众、客户或服务对象，并承担沟通责任。", tags: ["public_contact"] },
  { id: "cw_04", kind: "condition", text: "我愿意严格遵守流程、记录和合规要求，即使它们比较繁琐。", tags: ["precision"] }
];

export const careerCalibrationScale = [
  { value: 5, label: "非常符合" },
  { value: 4, label: "比较符合" },
  { value: 3, label: "不太确定" },
  { value: 2, label: "不太符合" },
  { value: 1, label: "完全不符合" }
];

function addTag(
  buckets: Record<string, number[]>,
  tag: string,
  value: number
) {
  buckets[tag] = [...(buckets[tag] ?? []), value];
}

function average(values?: number[]) {
  if (!values?.length) return 50;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function buildCareerCalibrationProfile(
  answers: AnswerMap = {}
): CareerCalibrationProfile {
  const interestBuckets: Record<string, number[]> = {};
  const capabilityBuckets: Record<string, number[]> = {};
  const constraintBuckets: Record<string, number[]> = {};

  for (const question of careerCalibrationQuestions) {
    const raw = answers[question.id];
    if (!raw) continue;
    const value = Math.max(0, Math.min(100, ((question.reverse ? 6 - raw : raw) - 1) * 25));
    const bucket =
      question.kind === "interest"
        ? interestBuckets
        : question.kind === "capability"
          ? capabilityBuckets
          : constraintBuckets;
    question.tags.forEach((tag) => addTag(bucket, tag, value));
  }

  const toProfile = (buckets: Record<string, number[]>) =>
    Object.fromEntries(Object.entries(buckets).map(([tag, values]) => [tag, average(values)]));

  return {
    interests: toProfile(interestBuckets),
    capabilities: toProfile(capabilityBuckets),
    constraints: toProfile(constraintBuckets),
    completionRate: Math.round(
      (careerCalibrationQuestions.filter((question) => Boolean(answers[question.id])).length /
        careerCalibrationQuestions.length) *
        100
    )
  };
}
