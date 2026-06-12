import { getTopAndLow } from "@/lib/scoring";
import type { BasicInfo, DimensionScore, ReportContext } from "@/lib/types";
import { matchAnalysis } from "@/lib/report/matchAnalysis";
import { matchCombinationRules } from "@/lib/report/matchCombinationRules";
import { buildCareerMatches } from "@/lib/career/matcher";
import type { AnswerMap, CareerRule } from "@/lib/types";

function toLegacyTracks(
  matches: ReturnType<typeof buildCareerMatches>["matches"]
): Array<CareerRule & { matchScore: number }> {
  return matches.families.map((family) => {
    const roles = [...matches.roles, ...matches.conditionalRoles].filter(
      (role) => role.familyId === family.familyId
    );
    const lead = roles[0];
    return {
      trackName: family.familyName,
      matchScore: family.score,
      conditions: [],
      reason: family.reason,
      suitableRoles: roles.length ? roles.map((role) => role.roleTitle) : family.roleTitles,
      entryPath: lead?.entryRequirements.join("；") || "先通过真实任务验证方向。",
      risks: lead?.gaps.join("；") || "需要继续验证真实任务、进入成本和长期投入意愿。",
      validationMethod: lead?.validationActions.join("；") || "访谈从业者并完成低成本真实任务。"
    };
  });
}

export function buildReportContext(
  basicInfo: BasicInfo,
  scores: DimensionScore[],
  calibrationAnswers: AnswerMap = {}
): ReportContext {
  const { topDimensions, lowDimensions } = getTopAndLow(scores);
  const { profile, matches } = buildCareerMatches(basicInfo, scores, calibrationAnswers);
  const careerFamilyNames = matches.families.map((family) => family.familyName);

  return {
    basicInfo,
    scores,
    topDimensions,
    lowDimensions,
    matchedAnalyses: matchAnalysis(scores),
    matchedCombinations: matchCombinationRules(scores).map((combination) => ({
      ...combination,
      suitableTracks: careerFamilyNames.slice(0, 3)
    })),
    matchedCareerTracks: toLegacyTracks(matches),
    careerCalibration: profile,
    careerMatches: matches,
    generatedAt: new Date().toISOString()
  };
}
