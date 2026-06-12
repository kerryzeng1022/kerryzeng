import { getCareerMatchLabel } from "@/lib/career/matcher";
import type { CareerReport, ReportContext } from "@/lib/types";

type Track = CareerReport["recommendedCareerTracks"][number];

function buildTrack(context: ReportContext, familyIndex: number): Track | null {
  const family = context.careerMatches?.families[familyIndex];
  if (!family || !context.careerMatches) return null;

  const roleDetails = [
    ...context.careerMatches.roles,
    ...context.careerMatches.conditionalRoles
  ]
    .filter((role) => role.familyId === family.familyId)
    .slice(0, 3);
  const leadRole = roleDetails[0];
  const status = leadRole?.status ?? "explore";
  const roles = roleDetails.length ? roleDetails.map((role) => role.roleTitle) : family.roleTitles;
  const requirements = leadRole?.entryRequirements.join("；") || "先用真实任务验证，再决定是否系统投入。";
  const gaps = leadRole?.gaps.length
    ? leadRole.gaps.join("；")
    : "当前没有明确硬性缺口，但仍需要验证日常任务是否愿意长期重复。";
  const validation = leadRole?.validationActions ?? ["访谈两位从业者", "完成一个小型真实任务", "复盘投入、产出与能量变化"];

  return {
    trackName: family.familyName,
    matchScore: family.score,
    matchLabel: getCareerMatchLabel(status),
    matchStatus: status,
    scoreBreakdown: leadRole?.scoreBreakdown,
    evidenceNotice: context.careerMatches.evidenceNotice,
    roleDetails,
    whySuitable: `${family.reason}。这表示该职业家族值得进入候选池，但具体岗位仍需要结合真实任务、教育背景和准入条件验证。`,
    plainWhy: `${family.reason}。`,
    suitableRoles: roles,
    entryPath: requirements,
    firstStepAction: validation[0],
    first90DaysValidation: validation.join("；"),
    validationSteps: validation,
    riskAndCorrection: `${gaps}。不要只根据职业名称作决定，先确认核心任务、工作条件和进入成本。`,
    riskCorrectionSteps: [
      gaps,
      "核验所在地教育、资格、招录或执业要求。",
      "若进入成本过高，优先验证相邻岗位中可迁移的任务与能力。"
    ]
  };
}

export function buildDeterministicCareerRecommendations(context: ReportContext): Track[] {
  if (!context.careerMatches) return [];
  return context.careerMatches.families
    .map((_, index) => buildTrack(context, index))
    .filter((track): track is Track => Boolean(track));
}

export function lockCareerRecommendations(report: CareerReport, context: ReportContext) {
  const deterministic = buildDeterministicCareerRecommendations(context);
  if (!deterministic.length) return report;

  const existing = new Map(report.recommendedCareerTracks.map((track) => [track.trackName, track]));
  return {
    ...report,
    recommendedCareerTracks: deterministic.map((track) => {
      const aiTrack = existing.get(track.trackName);
      return {
        ...track,
        whySuitable: aiTrack?.whySuitable || track.whySuitable,
        plainWhy: aiTrack?.plainWhy || track.plainWhy,
        first90DaysValidation: aiTrack?.first90DaysValidation || track.first90DaysValidation,
        validationSteps: aiTrack?.validationSteps?.length ? aiTrack.validationSteps : track.validationSteps,
        riskAndCorrection: aiTrack?.riskAndCorrection || track.riskAndCorrection,
        riskCorrectionSteps: aiTrack?.riskCorrectionSteps?.length
          ? aiTrack.riskCorrectionSteps
          : track.riskCorrectionSteps
      };
    })
  };
}
