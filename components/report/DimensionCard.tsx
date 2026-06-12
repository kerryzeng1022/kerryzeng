"use client";

import type { CareerReport } from "@/lib/types";
import { getDisplayTendency } from "@/lib/report/dimensionAxis";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

type DimensionAnalysis = CareerReport["dimensionAnalyses"][number];
type CardGroup = {
  title: string;
  items: string[];
  className: string;
};

function firstSentence(text: string) {
  return (text.match(/[^。！？!?]+[。！？!?]?/)?.[0] ?? text).trim();
}

function removeKnownSummary(text: string, knownParts: string[]) {
  let result = text;
  for (const part of knownParts) {
    const sentence = firstSentence(part);
    if (sentence.length > 12) {
      result = result.replace(sentence, "").trim();
    }
  }
  return result.replace(/^\s*[。！？!?，,、]+/, "").trim() || text;
}

function cleanPlainExplanation(text: string) {
  return text
    .replace(/^这项可以直接拿来筛岗位。?/, "")
    .replace(/^建议你用一个小实验验证[^：:]*[:：]\s*/, "")
    .trim();
}

export function DimensionCard({
  analysis,
  rank,
  tendencyStrength,
  forceExpanded = false
}: {
  analysis: DimensionAnalysis;
  rank?: number;
  tendencyStrength?: number;
  forceExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const showExpanded = expanded || forceExpanded;
  const keyConclusion = useMemo(
    () => analysis.userConclusion || firstSentence(analysis.baseConclusion || analysis.personalizedInsight),
    [analysis.userConclusion, analysis.baseConclusion, analysis.personalizedInsight]
  );
  const supplementalInsight = useMemo(
    () => removeKnownSummary(analysis.personalizedInsight, [keyConclusion, analysis.baseConclusion]),
    [analysis.personalizedInsight, keyConclusion, analysis.baseConclusion]
  );
  const signalGroups: CardGroup[] = [
    {
      title: "适合发挥",
      items: analysis.strengths,
      className: "bg-butter/45"
    },
    {
      title: "可能卡住",
      items: analysis.risks,
      className: "bg-rose-50"
    },
    {
      title: "可以这样做",
      items: analysis.suggestions,
      className: "bg-mint/55"
    }
  ];
  const tendency = getDisplayTendency(analysis, rank ? rank - 1 : 0);
  const displayStrength = tendencyStrength ?? tendency.displayStrength;
  const isRight = tendency.displayPosition >= 50;
  const segmentStyle = isRight
    ? { left: "50%", width: `${tendency.displayPosition - 50}%` }
    : { left: `${tendency.displayPosition}%`, width: `${50 - tendency.displayPosition}%` };

  return (
    <article className="rounded-[1.5rem] border border-rose-50 bg-white p-5 shadow-[0_12px_35px_rgba(255,75,106,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-rosepop">
            {rank ? `倾向第 ${rank} 明显` : "倾向分析"}
          </p>
          <h3 className="mt-1 text-xl font-black">{analysis.dimensionName}</h3>
        </div>
        <div className="text-right">
          <span className="rounded-full bg-butter px-4 py-2 text-sm font-black">
            {tendency.sideLabel}
          </span>
          <p className="mt-2 text-xs font-black text-rosepop">倾向 {displayStrength}%</p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-neutral-50 p-4">
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
        <div className="mt-2 flex justify-between gap-2 text-xs font-bold text-neutral-500">
          <span>{tendency.axis.leftLabel}</span>
          <span className="text-center text-neutral-400">{tendency.axis.centerLabel}</span>
          <span>{tendency.axis.rightLabel}</span>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-rose-50/70 p-4">
        <p className="text-xs font-black text-rosepop">这一项怎么看</p>
        <p className="mt-2 text-sm font-bold leading-7 text-neutral-800">{keyConclusion}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoBlock title="怎么理解" content={cleanPlainExplanation(analysis.plainExplanation || supplementalInsight)} />
        <InfoBlock title="下一步怎么验证" content={analysis.nextValidation || "本项暂无独立验证建议。"} />
      </div>

      {showExpanded ? (
        <div className="mt-4 space-y-3 rounded-3xl border border-rose-100 bg-white p-4">
          <TextSection title="你可能会怎么表现" content={analysis.workplaceManifestation} />
          <ListSection title="适合什么工作" items={analysis.suitableWork ?? []} />
          <ListSection title="不太适合什么工作" items={analysis.unsuitableWork ?? []} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {signalGroups.map((group) => (
          <div key={group.title} className={`rounded-2xl p-4 ${group.className}`}>
            <h4 className="font-black">{group.title}</h4>
            <ul className="mt-2 space-y-2 text-xs leading-5 text-neutral-700">
              {group.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="no-print mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rosepop px-5 py-3 text-sm font-black text-white md:w-auto"
      >
        {showExpanded ? "收起完整分析" : "展开完整分析"}
        {showExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </article>
  );
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <h4 className="font-black">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-neutral-700">{content}</p>
    </div>
  );
}

function TextSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="font-black text-rosepop">{title}</h4>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-neutral-700">{content}</p>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="font-black text-rosepop">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-neutral-700">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
