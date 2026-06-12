import type { CareerReport, DimensionScore, ReportContext, ScoreBand } from "@/lib/types";
import { getDimensionTendency, sortByTendencyStrength } from "@/lib/report/dimensionAxis";
import { getDimensionProfile } from "@/lib/report/reportQuality";
import { buildDeterministicCareerRecommendations } from "@/lib/report/careerRecommendations";

const bandCopy: Record<ScoreBand, { label: string; meaning: string; reminder: string }> = {
  high: {
    label: "右侧倾向",
    meaning: "这项会比较明显地参与你的职业选择，相关条件满足时，你更容易进入状态。",
    reminder: "关键不是把它当能力标签，而是看岗位日常是否真的支持这种工作偏好。"
  },
  medium: {
    label: "中间倾向",
    meaning: "你在这个维度上具备切换弹性，适配度会更依赖具体团队和任务设计。",
    reminder: "不要只看岗位名称，要追问日常节奏、评价标准和协作方式。"
  },
  low: {
    label: "左侧倾向",
    meaning: "这项会比较明显地影响你的筛选边界，反向条件太强时，容易让你长期硬扛。",
    reminder: "它不是短板诊断，而是在提醒你提前排除不适合长期投入的工作条件。"
  }
};

const dimensionFocus = [
  "收入结构和风险承受",
  "学习方式和成长速度",
  "外部认可和自我价值",
  "互动密度和恢复方式",
  "工作生活边界",
  "关系氛围和结果判断",
  "任务节奏和压力波峰",
  "授权程度和责任边界",
  "细节深度和战略视角",
  "理论输入和实践试错",
  "数据理性和直觉判断",
  "即时反馈和长期沉淀",
  "空间秩序和自由度",
  "利益目标和价值底线"
];

function scoreLevel(score: DimensionScore) {
  return bandCopy[score.scoreBand];
}

function dimensionInsight(score: DimensionScore, index: number, context: ReportContext) {
  const profile = getDimensionProfile(score.dimension);
  const focus = profile?.focus ?? dimensionFocus[index] ?? score.dimensionName;
  const copy = scoreLevel(score);
  const tendency = getDimensionTendency(score);
  const tendencyText =
    tendency.side === "center"
      ? `「${score.dimensionName}」目前靠近中间位置，说明你在这件事上弹性比较大`
      : `「${score.dimensionName}」当前位置 ${tendency.position}/100，更靠近「${tendency.sideLabel}」`;
  const currentStatus = context.basicInfo.status || "当前阶段";
  const confusion = context.basicInfo.biggestConfusion || "职业方向不够清晰";

  const fallbackLists = {
    focus,
    strengths: [`能把${score.dimensionName}转化成岗位筛选线索`, `更容易围绕${focus}识别适配机会`, "可以用真实经历校准职业方向，而不是只靠想象"],
    risks: [`如果忽略${focus}，可能会选到听起来正确但日常消耗很高的岗位`, "只看职业名称可能会忽略日常工作方式带来的真实消耗"],
    suggestions: [`面试时主动询问与${focus}相关的真实工作细节`, "用一到两个小项目验证自己是否愿意持续投入", "把收入、成长、边界和价值感放在同一张决策表里比较"]
  };
  const lists = profile ?? fallbackLists;

  return {
    baseConclusion: `${tendencyText}。${copy.meaning}${copy.reminder}`,
    personalizedInsight: `结合你目前「${currentStatus}」的状态，以及你提到的「${confusion}」，${score.dimensionName}需要被理解为关于「${focus}」的职业筛选条件。它不是在判断你行不行，而是在提示：什么样的工作条件会让你更容易稳定发挥，什么样的条件会让你明明能做却做得很累。`,
    workplaceManifestation: `在真实工作里，${score.dimensionName}要重点观察「${focus}」如何被触发：任务开始前你最在意什么，推进中什么条件会提升效率，结束后哪类反馈会让你愿意继续投入。建议你把最近三段典型经历拆开看，并优先记录「${lists.suggestions[0]}」这一类可验证信息。`,
    strengths: lists.strengths,
    risks: lists.risks,
    suggestions: lists.suggestions
  };
}

export function buildMockReport(context: ReportContext): CareerReport {
  const { basicInfo, scores } = context;
  const name = basicInfo.nickname || "你";
  const strongestDimensions = sortByTendencyStrength(scores);
  const centeredDimensions = [...scores]
    .sort((a, b) => getDimensionTendency(a).strength - getDimensionTendency(b).strength)
    .slice(0, 3);
  const riskDimensions = strongestDimensions.slice(0, 3);
  const topNames = strongestDimensions
    .slice(0, 3)
    .map((item) => `${item.dimensionName}（${getDimensionTendency(item).sideLabel}）`)
    .join("、");
  const centeredNames = centeredDimensions
    .map((item) => `${item.dimensionName}（${getDimensionTendency(item).sideLabel}）`)
    .join("、");
  const target = basicInfo.incomeGoal || "更清晰的职业方向";
  const confusion = basicInfo.biggestConfusion || "不知道自己适合什么";

  const dimensionAnalyses = scores.map((score, index) => {
    const insight = dimensionInsight(score, index, context);
    return {
      dimension: score.dimension,
      dimensionName: score.dimensionName,
      score: score.score,
      scoreLevel: scoreLevel(score).label,
      ...insight
    };
  });

  return {
    cover: {
      title: `${name}的职业天赋挖掘报告`,
      subtitle: "基于 14 个职业维度的职业方向、能量消耗点与行动建议",
      userProfileSummary: `${basicInfo.status || "当前状态待补充"} / ${
        basicInfo.occupation || "职业或专业待补充"
      } / ${basicInfo.city || "城市待补充"}`,
      generatedAt: new Date(context.generatedAt).toLocaleString("zh-CN")
    },
    oneSentenceProfile: `${name}目前最明显的工作偏好是：${topNames}。选方向时先找日常任务和这些偏好对得上的环境，再看收入、成长和边界能不能长期成立。`,
    overallSummary: `这份报告先看倾向。你目前最明显的工作偏好集中在${topNames}，说明这些条件会比较强地影响你的职业体感：对上了，你更容易稳定投入；长期反着来，你可能会觉得明明能做，却总是做得很耗。

你写下的主要困惑是「${confusion}」，目标是「${target}」。因此，后续选择不建议只问“哪个职业听起来更好”，而要问“哪个方向能同时满足现实目标、工作节奏、成长空间和能量边界”。当你把岗位拆成任务、协作、反馈、收入和价值底线五个部分，很多模糊焦虑会变成可以比较的条件。

相对居中的位置是${centeredNames || "暂时没有特别居中的维度"}。这些地方不用急着下判断，更适合在真实任务里观察：你是能灵活切换，还是需要某种条件稳定下来才舒服。真正适合你的方向，通常不是让你完全轻松，而是让你愿意为了有价值的目标投入，同时不会长期牺牲生活边界和价值感。`,
    dimensionAnalyses,
    coreStrengthCombinations: context.matchedCombinations.slice(0, 4).map((item) => ({
      title: item.name,
      relatedDimensions: item.conditions.map((condition) => condition.split(":")[0]),
      analysis: `${item.insight} 这个组合的重点是：你不需要把自己拆成单一标签，而要看多个维度叠加后形成的工作方式。适配岗位时，请同时观察任务目标、协作对象、反馈周期和你完成后的能量变化。`,
      suitableScenarios: item.suitableTracks,
      riskReminder: `${item.risk} ${item.suggestion}`
    })),
    careerRiskZones: riskDimensions.map((item) => ({
      title: `${item.dimensionName}相关消耗区`,
      reason: `当岗位长期放大${item.dimensionName}的反向要求时，你可能会发现自己不是不会做，而是需要持续用意志力对抗工作方式。短期可以应付，长期会影响判断和信心。`,
      typicalScenarios: [
        "岗位描述很诱人，但日常任务和你的节奏相反",
        "团队评价标准模糊，反馈滞后或边界不清",
        "收入或头衔补偿不了持续消耗"
      ],
      avoidSuggestion: "优先通过信息访谈、短项目或试岗任务确认真实工作方式。"
    })),
    recommendedCareerTracks: buildDeterministicCareerRecommendations(context),
    notRecommendedEnvironments: riskDimensions.map((item) => ({
      environment: `长期放大${item.dimensionName}反向要求的环境`,
      reason: `这类环境会让你持续用意志力维持表现，容易把环境不适配误读成自己不够努力。`,
      howToIdentify: "面试时询问真实工作日程、汇报对象、加班频率、评价标准和离职原因。"
    })),
    ninetyDayActionPlan: {
      month1:
        "第 1 个月重点做信息校准：整理过往经历，筛出 3 个候选方向，分别访谈从业者，记录任务内容、收入结构、成长曲线和消耗点。",
      month2:
        "第 2 个月重点做低成本验证：选择最有可能的方向完成一个小作品、小项目或短期兼职，观察自己是否愿意持续投入。",
      month3:
        "第 3 个月重点做路径选择：根据验证结果决定是转岗、转行、内部争取机会还是先补能力，同时评估现实收入目标。",
      weeklyActions: [
        "每周记录一次能量高点和低点",
        "每周访谈一位目标岗位从业者",
        "每周沉淀一个可展示成果",
        "每周更新职业方向决策表"
      ]
    },
    finalAdvice:
      "最后，请把这份报告当作职业选择的起点，而不是终点。你真正需要的不是一个听起来漂亮的职业名称，而是一套能被验证的方向假设。先把自己放进更接近目标岗位的真实任务里，再观察动力、消耗、反馈和成长是否同时成立。当四个指标都能稳定成立时，这个方向才更值得长期投入。",
    upsellToAgent: {
      title: "想进一步知道自己该往哪个方向走？",
      description:
        "你的基础报告已经完成了职业天赋画像。如果你想进一步结合具体经历、学历、城市、收入目标、行业选择和转型风险，可以继续和深度职业智能体对话，生成更具体的职业路径。",
      suggestedQuestions: [
        "我现在的经历适合转向哪个赛道？",
        "我的 90 天验证计划应该怎么排？",
        "如果我想提高收入，优先补哪类能力？"
      ]
    }
  };
}
