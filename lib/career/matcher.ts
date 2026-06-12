import { careerCatalog, getCareerFamily, type CareerRoleDefinition } from "@/lib/career/catalog";
import { buildCareerCalibrationProfile } from "@/lib/career/calibration";
import { getDimensionTendency, sortByTendencyStrength } from "@/lib/report/dimensionAxis";
import type {
  AnswerMap,
  BasicInfo,
  CareerCalibrationProfile,
  CareerMatchStatus,
  CareerMatches,
  CareerRoleMatch,
  DimensionScore
} from "@/lib/types";

const educationRank: Record<string, number> = {
  "高中/中专": 1,
  "大专": 2,
  "本科": 3,
  "硕士": 4,
  "博士及以上": 5
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function profileValue(values: Record<string, number>, tags: string[]) {
  if (!tags.length) return 50;
  return Math.round(tags.reduce((sum, tag) => sum + (values[tag] ?? 50), 0) / tags.length);
}

function workStyleFit(role: CareerRoleDefinition, scores: DimensionScore[]) {
  const ranks = new Map(sortByTendencyStrength(scores).map((score, index) => [score.dimension, index]));
  let weightedFit = 0;
  let weights = 0;

  for (const [dimension, target] of Object.entries(role.workStyleTargets)) {
    const score = scores.find((item) => item.dimension === dimension);
    if (!score) continue;
    const rank = ranks.get(dimension) ?? scores.length;
    const tendencyWeight = rank < 3 ? 2.4 : rank < 7 ? 1.05 : 0.45;
    const targetFit = clamp(100 - Math.abs(score.score - target) * 1.45);
    weightedFit += targetFit * tendencyWeight;
    weights += tendencyWeight;
  }

  return weights ? clamp(weightedFit / weights) : 50;
}

function hasRelevantCredentials(role: CareerRoleDefinition, basicInfo: BasicInfo) {
  const text = `${basicInfo.credentials ?? ""} ${basicInfo.professionalBackground ?? ""} ${basicInfo.occupation ?? ""}`;
  const keywords = [
    role.roleTitle.replace(/专员|经理|助理|师|员|主管/g, ""),
    role.name.replace(/与|、/g, " "),
    "执业",
    "资格"
  ].filter((keyword) => keyword.length >= 2);
  return keywords.some((keyword) => text.includes(keyword));
}

function feasibilityFit(
  role: CareerRoleDefinition,
  basicInfo: BasicInfo,
  profile: CareerCalibrationProfile
) {
  const education = educationRank[basicInfo.education] ?? 2;
  const years = Number.parseInt(basicInfo.yearsExperience ?? "0", 10) || 0;
  const background = `${basicInfo.occupation ?? ""} ${basicInfo.professionalBackground ?? ""}`;
  const backgroundBonus = background.includes(role.roleTitle.slice(0, 2)) || background.includes(role.name.slice(0, 2)) ? 18 : 0;
  const credentialReady = hasRelevantCredentials(role, basicInfo);

  if (role.regulated) {
    if (credentialReady) return clamp(82 + Math.min(12, years * 2));
    const training = profile.constraints.long_training ?? 50;
    const licensing = profile.constraints.licensing ?? 50;
    return clamp(education * 8 + training * 0.2 + licensing * 0.2 + backgroundBonus);
  }

  return clamp(54 + education * 5 + Math.min(15, years * 2) + backgroundBonus);
}

function conflictPenalty(role: CareerRoleDefinition, profile: CareerCalibrationProfile) {
  let penalty = 0;
  if (role.regulated && (profile.constraints.licensing ?? 50) < 40) penalty += 18;
  if (role.regulated && (profile.constraints.long_training ?? 50) < 40) penalty += 14;
  if (role.requiresShifts && (profile.constraints.shifts ?? 50) < 40) penalty += 12;
  if (role.requiresRiskTolerance && (profile.constraints.risk_public ?? 50) < 40) penalty += 14;
  return Math.min(35, penalty);
}

function statusFor(role: CareerRoleDefinition, score: number, basicInfo: BasicInfo, completionRate: number): CareerMatchStatus {
  if (role.regulated && !hasRelevantCredentials(role, basicInfo)) return "conditional";
  if (score >= 78 && completionRate >= 70) return "strong";
  if (score >= 65) return "promising";
  return "explore";
}

function matchLabel(status: CareerMatchStatus) {
  if (status === "strong") return "强匹配";
  if (status === "promising") return "值得重点验证";
  if (status === "conditional") return "条件性方向";
  return "探索方向";
}

function strongestReasons(role: CareerRoleDefinition, scores: DimensionScore[], profile: CareerCalibrationProfile) {
  const tendencies = sortByTendencyStrength(scores)
    .filter((score) => role.workStyleTargets[score.dimension] !== undefined)
    .slice(0, 2)
    .map((score) => `${score.dimensionName}呈现「${getDimensionTendency(score).sideLabel}」倾向`);
  const capability = role.capabilityTags
    .map((tag) => ({ tag, score: profile.capabilities[tag] ?? 50 }))
    .sort((a, b) => b.score - a.score)[0];
  return [
    ...tendencies,
    capability && capability.score >= 60 ? `相关能力证据达到 ${capability.score}/100` : "相关能力仍需要用真实任务验证"
  ].slice(0, 3);
}

function roleGaps(role: CareerRoleDefinition, basicInfo: BasicInfo, profile: CareerCalibrationProfile) {
  const gaps: string[] = [];
  if (role.regulated && !hasRelevantCredentials(role, basicInfo)) {
    gaps.push("尚未确认具备所在地要求的专业教育、招录或执业资格");
  }
  if (role.requiresShifts && (profile.constraints.shifts ?? 50) < 50) {
    gaps.push("需要进一步确认对轮班或值班安排的接受度");
  }
  if (role.requiresRiskTolerance && (profile.constraints.risk_public ?? 50) < 50) {
    gaps.push("需要进一步确认对现场风险和公共责任的接受度");
  }
  return gaps;
}

function adjacentRoles(role: CareerRoleDefinition) {
  return role.adjacentFamilies
    .flatMap((familyId) => getCareerFamily(familyId)?.roles.slice(0, 1) ?? [])
    .slice(0, 3);
}

function matchRole(
  role: CareerRoleDefinition,
  basicInfo: BasicInfo,
  scores: DimensionScore[],
  profile: CareerCalibrationProfile
): CareerRoleMatch {
  const workStyle = workStyleFit(role, scores);
  const capabilityEvidence = profileValue(profile.capabilities, role.capabilityTags);
  const interest = profileValue(profile.interests, role.interestTags);
  const feasibility = feasibilityFit(role, basicInfo, profile);
  const conflict = conflictPenalty(role, profile);
  let score = clamp(workStyle * 0.4 + capabilityEvidence * 0.25 + interest * 0.2 + feasibility * 0.15 - conflict);
  if (profile.completionRate < 70) score = Math.min(score, 64);
  const status = statusFor(role, score, basicInfo, profile.completionRate);

  return {
    roleId: role.roleId,
    roleTitle: role.roleTitle,
    familyId: role.id,
    familyName: role.name,
    score,
    status,
    scoreBreakdown: {
      workStyle,
      capabilityEvidence,
      interest,
      feasibility,
      conflictPenalty: conflict
    },
    why: strongestReasons(role, scores, profile),
    entryRequirements: role.requirements ?? ["通过作品、项目或相关经历证明可迁移能力"],
    gaps: roleGaps(role, basicInfo, profile),
    adjacentRoles: adjacentRoles(role),
    validationActions: role.validationActions
  };
}

export function buildCareerMatches(
  basicInfo: BasicInfo,
  scores: DimensionScore[],
  calibrationAnswers: AnswerMap = {}
): { profile: CareerCalibrationProfile; matches: CareerMatches } {
  const profile = buildCareerCalibrationProfile(calibrationAnswers);
  const allMatches = careerCatalog
    .map((role) => matchRole(role, basicInfo, scores, profile))
    .sort((a, b) => b.score - a.score);

  const familyScores = new Map<string, CareerRoleMatch[]>();
  for (const match of allMatches) {
    familyScores.set(match.familyId, [...(familyScores.get(match.familyId) ?? []), match]);
  }

  const families = [...familyScores.entries()]
    .map(([familyId, roles]) => {
      const top = roles.slice(0, 3);
      const score = clamp((top[0]?.score ?? 0) * 0.5 + (top[1]?.score ?? 0) * 0.3 + (top[2]?.score ?? 0) * 0.2);
      return {
        familyId,
        familyName: roles[0].familyName,
        score,
        roleTitles: top.map((role) => role.roleTitle),
        reason: top[0].why.join("；")
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const selectedRoles: CareerRoleMatch[] = [];
  const perFamily = new Map<string, number>();
  for (const match of allMatches.filter((item) => item.status !== "conditional" && item.score >= 50)) {
    if ((perFamily.get(match.familyId) ?? 0) >= 2) continue;
    selectedRoles.push(match);
    perFamily.set(match.familyId, (perFamily.get(match.familyId) ?? 0) + 1);
    if (selectedRoles.length >= 6) break;
  }

  const conditionalRoles = allMatches
    .filter((item) => {
      const role = careerCatalog.find((candidate) => candidate.roleId === item.roleId);
      const coreInterest = role ? profile.interests[role.interestTags[0]] ?? 50 : 50;
      const coreCapability = role ? profile.capabilities[role.capabilityTags[0]] ?? 50 : 50;
      return (
        item.status === "conditional" &&
        item.score >= 65 &&
        coreInterest >= 65 &&
        coreCapability >= 65
      );
    })
    .filter((item, index, items) => items.findIndex((other) => other.familyId === item.familyId) === index)
    .slice(0, 2);

  const topScore = families[0]?.score ?? 0;
  const evidenceNotice =
    profile.completionRate < 70
      ? "职业校准信息不足，本次结果只能作为探索方向，不能视为强匹配或执业资格判断。"
      : topScore < 65
        ? "当前职业信号比较分散，没有形成明确强匹配；以下方向仅用于安排真实任务验证，不代表职业结论。"
        : "结果综合了工作偏好、兴趣、真实能力证据与进入条件；具体职业仍建议通过真实任务验证。";

  return {
    profile,
    matches: {
      families,
      roles: selectedRoles,
      conditionalRoles,
      evidenceNotice,
      matchingVersion: 2
    }
  };
}

export function getCareerMatchLabel(status: CareerMatchStatus) {
  return matchLabel(status);
}
