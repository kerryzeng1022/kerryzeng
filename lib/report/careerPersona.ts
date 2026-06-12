import { getDimensionTendency } from "@/lib/report/dimensionAxis";
import type { DimensionScore, StoredReport } from "@/lib/types";

const nameByDimension: Record<string, string> = {
  power_execution: "授权协作型推进者",
  social_energy: "低耗专注型分析者",
  boundary_clarity: "边界清晰型规划者",
  thinking_granularity: "结构拆解型研究者",
  information_processing: "信息整合型判断者",
  income_drive: "现实目标型选择者",
  growth_mode: "持续升级型学习者",
  feedback_cycle: "反馈驱动型行动者",
  drive_logic: "证据判断型决策者",
  moral_threshold: "底线清晰型守护者",
  environment_dependence: "环境校准型执行者",
  pressure_rhythm: "节奏管理型推进者",
  recognition_source: "成果可见型创造者",
  recognition_logic: "协作认同型连接者"
};

const imageByDimension: Record<string, string> = {
  power_execution: "/images/personas/project-coordinator.png",
  social_energy: "/images/personas/focused-analyst.png",
  boundary_clarity: "/images/personas/boundary-planner.png",
  thinking_granularity: "/images/personas/research-thinker.png",
  information_processing: "/images/personas/information-curator.png",
  income_drive: "/images/personas/income-strategist.png",
  growth_mode: "/images/personas/growth-learner.png",
  feedback_cycle: "/images/personas/feedback-maker.png",
  drive_logic: "/images/personas/evidence-decider.png",
  moral_threshold: "/images/personas/ethics-guardian.png",
  environment_dependence: "/images/personas/environment-calibrator.png",
  pressure_rhythm: "/images/personas/rhythm-manager.png",
  recognition_source: "/images/personas/feedback-maker.png",
  recognition_logic: "/images/personas/project-coordinator.png"
};

function keywordFor(score: DimensionScore) {
  return getDimensionTendency(score).sideLabel;
}

export function buildCareerPersona(storedReport: StoredReport) {
  const topScores = [...storedReport.scores].sort(
    (a, b) => getDimensionTendency(b).strength - getDimensionTendency(a).strength
  );
  const primary = topScores[0];
  const secondary = topScores[1];
  const third = topScores[2];
  const track = storedReport.report.recommendedCareerTracks[0];
  const typeName = nameByDimension[primary?.dimension ?? ""] ?? "职业方向验证者";
  const roleList = track?.suitableRoles?.slice(0, 3) ?? [];
  const roles = roleList.join("、") || track?.trackName || "候选岗位";
  const primaryLabel = primary ? getDimensionTendency(primary).sideLabel : "清楚判断";
  const secondaryLabel = secondary ? getDimensionTendency(secondary).sideLabel : "稳定推进";
  const thirdLabel = third ? getDimensionTendency(third).sideLabel : "低耗验证";
  const definition = `你不是只靠热情选方向的人，更像是把真实日常拆开判断的人：目标能不能说清，谁能拍板，协作会不会拖垮你，做完以后值不值得继续。`;
  const idealRoles = roleList.length ? roleList : [track?.trackName ?? "候选岗位"];
  const idealReason = `你的突出信号是「${primaryLabel}、${secondaryLabel}、${thirdLabel}」。所以职业画像不是“什么都能试”，而是先找目标明确、责任边界清楚、沟通成本可控的岗位，把偏好变成稳定产出。`;
  const validationFocus = `先验证三件事：日常任务是不是清楚，关键决定是不是有人拍板，做完一次项目后你是更想复盘优化，还是只想尽快逃离。`;
  const keywords = [primary, secondary, third].filter(Boolean).map(keywordFor);

  return {
    typeName,
    imagePath: imageByDimension[primary?.dimension ?? ""] ?? "/images/personas/project-coordinator.png",
    definition,
    idealRoles,
    idealReason,
    validationFocus,
    keywords,
    suitableEnvironment:
      storedReport.report.plainLanguageProfile?.chooseEnvironment?.slice(0, 2) ??
      ["目标清楚、反馈真实的环境", "责任、资源和拍板边界说得明白的团队"],
    avoidLosses:
      storedReport.report.plainLanguageProfile?.manageLosses?.slice(0, 2) ??
      ["避免长期权责不清", "避免把低效沟通当作成长"]
  };
}
