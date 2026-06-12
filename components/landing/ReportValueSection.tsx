import { Activity, ListChecks, Radar, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const values: Array<[string, LucideIcon]> = [
  ["天赋优势 Top 能力雷达图", Radar],
  ["能量消耗点深度解析", Activity],
  ["适合方向精准匹配", Route],
  ["成长建议行动清单", ListChecks]
];

export function ReportValueSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h2 className="xhs-section-title text-center text-2xl md:text-3xl">
        你将获得一份超有价值的报告 ✨
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {values.map(([title, Icon]) => (
          <div key={title} className="rounded-[1.35rem] border border-rose-50 bg-white p-5 shadow-[0_12px_35px_rgba(255,75,106,0.08)]">
            <Icon className="text-rosepop" />
            <h3 className="mt-4 font-black leading-6">{title}</h3>
            <p className="mt-3 text-xs leading-5 text-neutral-500">
              重点维度可视化，帮你把模糊感受变成可行动的职业判断。
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
