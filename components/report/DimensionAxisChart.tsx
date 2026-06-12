import { buildDisplayTendencyMap } from "@/lib/report/dimensionAxis";
import type { DimensionScore } from "@/lib/types";

export function DimensionAxisChart({ scores }: { scores: DimensionScore[] }) {
  const displayTendencies = buildDisplayTendencyMap(scores);

  return (
    <div className="mt-5 grid gap-4">
      {scores.map((score) => {
        const tendency = displayTendencies.get(score.dimension);
        if (!tendency) return null;
        const isRight = tendency.displayPosition >= 50;
        const segmentStyle = isRight
          ? { left: "50%", width: `${tendency.displayPosition - 50}%` }
          : { left: `${tendency.displayPosition}%`, width: `${50 - tendency.displayPosition}%` };
        return (
          <div key={score.dimension} className="rounded-3xl bg-rose-50/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black">{score.dimensionName}</h3>
                <p className="mt-1 text-xs font-bold text-neutral-500">
                  当前更靠近：{tendency.sideLabel}
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-rosepop">
                倾向 {tendency.displayStrength}%
              </span>
            </div>
            <div className="mt-4">
              <div className="relative h-5 rounded-full bg-white shadow-inner">
                <div
                  className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-full ${
                    isRight ? "bg-gradient-to-r from-rose-200 to-rosepop" : "bg-gradient-to-l from-rose-200 to-rosepop"
                  }`}
                  style={segmentStyle}
                />
                <div className="absolute left-1/2 top-[-6px] h-8 w-px bg-neutral-300" />
                <div
                  className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-rosepop shadow-soft"
                  style={{ left: `${tendency.displayPosition}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between gap-3 text-xs font-bold text-neutral-500">
                <span>{tendency.axis.leftLabel}</span>
                <span className="text-center text-neutral-400">{tendency.axis.centerLabel}</span>
                <span>{tendency.axis.rightLabel}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
