import type { CareerReport } from "@/lib/types";

type Track = CareerReport["recommendedCareerTracks"][number];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function asQuestion(text: string) {
  return text.replace(/^确认你?/, "你到底").replace(/^确认/, "问清");
}

export function getDisplayMatchScore(matchScore: number, rank: number, isV2 = false) {
  if (isV2) return clamp(Math.round(matchScore), 0, 100);
  const rankBoosted = 96 - Math.max(0, rank - 1) * 4;
  const rawAdjusted = 82 + Math.round(clamp(matchScore, 0, 100) * 0.14);
  return clamp(Math.max(rankBoosted, rawAdjusted), 82, 96);
}

export function formatTrackRoles(track?: Track) {
  if (!track) return "";
  return track.suitableRoles.slice(0, 3).join("、");
}

export function firstSentence(text?: string) {
  if (!text) return "";
  return (text.match(/[^。！？!?]+[。！？!?]?/)?.[0] ?? text).trim();
}

export function buildHeroSummary(report: CareerReport) {
  const track = report.recommendedCareerTracks[0];
  const roles = formatTrackRoles(track);
  const risk = track?.riskCorrectionSteps?.[0] || track?.riskAndCorrection || "别只看岗位名称，要看真实任务和团队给不给资源。";

  if (!track) {
    return "先别急着给自己贴职业标签，拿 2-3 个具体岗位做低成本验证：看日常任务、团队边界、收入结构和做完后的能量变化。";
  }

  return `先把「${roles || track.trackName}」这类岗位放进候选池。你要找的是目标清楚、负责人清楚、截止时间清楚的团队。比如跨部门项目推进：把需求拆成任务，盯节点，协调资源，最后复盘结果。同时要留意：${risk}`;
}

export function buildHeroCards(report: CareerReport) {
  const track = report.recommendedCareerTracks[0];
  const roles = formatTrackRoles(track);
  return [
    {
      title: "可以先试",
      items: [
        roles ? `具体职业：${roles}` : `具体赛道：${track?.trackName ?? "先选 2-3 个候选方向"}`,
        `试做动作：${track?.firstStepAction || track?.entryPath || "拆一个真实任务，看自己是否愿意反复做。"}`,
        "面试重点：问清谁拍板、你能调什么资源、交付标准怎么算。"
      ]
    },
    {
      title: "先确认这些坑",
      items: [
        track?.riskCorrectionSteps?.[0] || "责任给你、权限不给你、资源也不给你的项目。",
        track?.riskCorrectionSteps?.[1]
          ? `先问清：${asQuestion(track.riskCorrectionSteps[1])}`
          : "下班后长期待命、临时背锅、需求天天变的团队。",
        track?.riskCorrectionSteps?.[2] || "靠人情应酬和低效会议推进，真正做事时间很少的环境。"
      ]
    }
  ];
}
