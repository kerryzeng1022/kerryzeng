import type { CareerReport } from "@/lib/types";
import { formatTrackRoles, getDisplayMatchScore } from "@/lib/report/reportDisplay";

type Track = CareerReport["recommendedCareerTracks"][number];

export function CareerTrackCard({ track, rank }: { track: Track; rank: number }) {
  const displayScore = getDisplayMatchScore(track.matchScore, rank, Boolean(track.scoreBreakdown));
  const roles = formatTrackRoles(track);

  return (
    <article className="rounded-[1.5rem] border border-rose-50 bg-white p-5 shadow-[0_12px_35px_rgba(255,75,106,0.08)] md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-rosepop">推荐赛道 {rank}</p>
          <h3 className="mt-1 text-2xl font-black">{track.trackName}</h3>
        </div>
        <span className="rounded-full bg-rosepop px-4 py-2 text-sm font-black text-white">
          {track.matchLabel ?? `推荐 ${displayScore}%`}
        </span>
      </div>
      <div className="mt-4 h-3 rounded-full bg-rose-100">
        <div className="h-full rounded-full bg-gradient-to-r from-coral to-rosepop" style={{ width: `${displayScore}%` }} />
      </div>
      <div className="mt-4 rounded-3xl bg-butter/60 p-4">
        <p className="text-sm font-black text-amber-800">具体职业可以先看</p>
        <p className="mt-2 text-xl font-black leading-8">{roles || track.trackName}</p>
      </div>
      {track.scoreBreakdown ? (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-neutral-700 md:grid-cols-4">
          <ScorePart label="工作方式" value={track.scoreBreakdown.workStyle} />
          <ScorePart label="能力证据" value={track.scoreBreakdown.capabilityEvidence} />
          <ScorePart label="领域兴趣" value={track.scoreBreakdown.interest} />
          <ScorePart label="进入可行性" value={track.scoreBreakdown.feasibility} />
        </div>
      ) : null}
      {track.evidenceNotice ? (
        <p className="mt-3 rounded-2xl bg-sky-50 px-4 py-3 text-xs font-bold leading-6 text-sky-800">
          {track.evidenceNotice}
        </p>
      ) : null}
      <p className="mt-4 rounded-3xl bg-rose-50 p-4 text-base font-bold leading-7 text-neutral-800">
        {track.plainWhy || track.whySuitable}
      </p>
      <p className="mt-4 text-sm leading-7 text-neutral-700">
        <b>进入路径：</b>
        {track.entryPath}
      </p>
      <InfoSection title="第一步先做什么" items={[track.firstStepAction || track.entryPath]} />
      <InfoSection title="90 天怎么验证" items={track.validationSteps ?? [track.first90DaysValidation]} />
      <InfoSection title="风险怎么校正" items={track.riskCorrectionSteps ?? [track.riskAndCorrection]} tone="risk" />
    </article>
  );
}

function ScorePart({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-neutral-50 px-3 py-2">
      <span className="block text-neutral-500">{label}</span>
      <span className="mt-1 block text-base text-ink">{value}</span>
    </div>
  );
}

function InfoSection({
  title,
  items,
  tone = "normal"
}: {
  title: string;
  items: string[];
  tone?: "normal" | "risk";
}) {
  return (
    <div className={`mt-4 rounded-3xl p-4 ${tone === "risk" ? "bg-rose-50" : "bg-neutral-50"}`}>
      <h4 className="font-black">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-neutral-700">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
