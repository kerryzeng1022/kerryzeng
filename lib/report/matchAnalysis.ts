import analysisLibrary from "@/data/analysis-library.json";
import type { AnalysisAsset, DimensionScore } from "@/lib/types";

const assets = analysisLibrary as AnalysisAsset[];

export function matchAnalysis(scores: DimensionScore[]) {
  return scores.map((score) => {
    const match = assets.find(
      (asset) =>
        asset.dimension === score.dimension && asset.scoreBand === score.scoreBand
    );
    if (!match) {
      throw new Error(`Missing analysis asset for ${score.dimension}`);
    }
    return match;
  });
}
