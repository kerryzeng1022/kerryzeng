import type { DimensionScore } from "@/lib/types";

export type DimensionAxis = {
  dimension: string;
  leftLabel: string;
  rightLabel: string;
  centerLabel: string;
};

export type DimensionTendency = {
  axis: DimensionAxis;
  side: "left" | "right" | "center";
  sideLabel: string;
  strength: number;
  position: number;
};

export type DisplayTendency = DimensionTendency & {
  displayStrength: number;
  displayPosition: number;
};

export const dimensionAxes: Record<string, DimensionAxis> = {
  income_drive: {
    dimension: "income_drive",
    leftLabel: "稳定安全",
    rightLabel: "高回报冲刺",
    centerLabel: "收入与稳定都要看"
  },
  growth_mode: {
    dimension: "growth_mode",
    leftLabel: "先做熟",
    rightLabel: "持续升级",
    centerLabel: "稳定与成长都能切换"
  },
  recognition_source: {
    dimension: "recognition_source",
    leftLabel: "自我认可",
    rightLabel: "外部看见",
    centerLabel: "内外认可都在意"
  },
  social_energy: {
    dimension: "social_energy",
    leftLabel: "独立专注",
    rightLabel: "高频互动",
    centerLabel: "独处和互动都需要"
  },
  boundary_clarity: {
    dimension: "boundary_clarity",
    leftLabel: "弹性融合",
    rightLabel: "边界清楚",
    centerLabel: "能配合也要边界"
  },
  recognition_logic: {
    dimension: "recognition_logic",
    leftLabel: "结果优先",
    rightLabel: "氛围认同",
    centerLabel: "结果和氛围都影响你"
  },
  pressure_rhythm: {
    dimension: "pressure_rhythm",
    leftLabel: "稳定推进",
    rightLabel: "阶段冲刺",
    centerLabel: "忙闲变化可适应"
  },
  power_execution: {
    dimension: "power_execution",
    leftLabel: "配合执行",
    rightLabel: "主动拍板",
    centerLabel: "执行和推进都能做"
  },
  thinking_granularity: {
    dimension: "thinking_granularity",
    leftLabel: "抓大方向",
    rightLabel: "深挖细节",
    centerLabel: "能看全局也能拆细"
  },
  information_processing: {
    dimension: "information_processing",
    leftLabel: "边做边学",
    rightLabel: "先研究清楚",
    centerLabel: "研究和试错都能用"
  },
  drive_logic: {
    dimension: "drive_logic",
    leftLabel: "直觉现场",
    rightLabel: "数据证据",
    centerLabel: "感觉和证据都要看"
  },
  feedback_cycle: {
    dimension: "feedback_cycle",
    leftLabel: "长期沉淀",
    rightLabel: "即时反馈",
    centerLabel: "短反馈和长期目标都需要"
  },
  environment_dependence: {
    dimension: "environment_dependence",
    leftLabel: "适应变化",
    rightLabel: "环境稳定",
    centerLabel: "能适应也要稳定条件"
  },
  moral_threshold: {
    dimension: "moral_threshold",
    leftLabel: "现实弹性",
    rightLabel: "底线明确",
    centerLabel: "现实和底线都要平衡"
  }
};

export function getDimensionAxis(dimension: string): DimensionAxis {
  return (
    dimensionAxes[dimension] ?? {
      dimension,
      leftLabel: "左侧倾向",
      rightLabel: "右侧倾向",
      centerLabel: "中间倾向"
    }
  );
}

export function getDimensionTendency(score: DimensionScore | { dimension: string; score: number }): DimensionTendency {
  const axis = getDimensionAxis(score.dimension);
  const position = Math.max(0, Math.min(100, score.score));
  const distance = Math.abs(position - 50);
  const strength = Math.round(distance * 2);

  if (distance < 8) {
    return {
      axis,
      side: "center",
      sideLabel: axis.centerLabel,
      strength,
      position
    };
  }

  const side = position < 50 ? "left" : "right";
  return {
    axis,
    side,
    sideLabel: side === "left" ? axis.leftLabel : axis.rightLabel,
    strength,
    position
  };
}

export function sortByTendencyStrength<T extends { dimension: string; score: number }>(items: T[]) {
  return [...items].sort((a, b) => {
    const strengthDiff = getDimensionTendency(b).strength - getDimensionTendency(a).strength;
    if (strengthDiff !== 0) return strengthDiff;
    return b.score - a.score;
  });
}

export function getTendencyIndex(
  score: DimensionScore | { dimension: string; score: number },
  rank = 0
) {
  return getDisplayTendency(score, rank).displayStrength;
}

export function getDisplayTendency(
  score: DimensionScore | { dimension: string; score: number },
  rank = 0
): DisplayTendency {
  const tendency = getDimensionTendency(score);

  if (tendency.side === "center") {
    return {
      ...tendency,
      displayStrength: Math.round(tendency.strength * 1.2),
      displayPosition: tendency.position
    };
  }

  const rankAnchor = Math.max(28, 96 - rank * 7);
  const rawAnchor = Math.round(35 + tendency.strength * 1.25);
  const displayStrength = Math.max(28, Math.min(96, Math.max(rankAnchor, rawAnchor)));
  const displayDistance = displayStrength / 2;
  const displayPosition = tendency.side === "right" ? 50 + displayDistance : 50 - displayDistance;

  return {
    ...tendency,
    displayStrength,
    displayPosition
  };
}

export function buildTendencyIndexMap<T extends { dimension: string; score: number }>(items: T[]) {
  const sorted = sortByTendencyStrength(items);
  return new Map(
    sorted.map((item, index) => [item.dimension, getTendencyIndex(item, index)])
  );
}

export function buildDisplayTendencyMap<T extends { dimension: string; score: number }>(items: T[]) {
  const sorted = sortByTendencyStrength(items);
  return new Map(sorted.map((item, index) => [item.dimension, getDisplayTendency(item, index)]));
}
