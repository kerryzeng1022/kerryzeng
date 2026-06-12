"use client";

import { getDimensionTendency, sortByTendencyStrength } from "@/lib/report/dimensionAxis";
import type { StoredReport } from "@/lib/types";
import { Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";

export function LockedReportPreview({ storedReport }: { storedReport: StoredReport }) {
  const [paying, setPaying] = useState(false);
  const previewTendencies = sortByTendencyStrength(storedReport.scores).slice(0, 3);

  async function pay() {
    setPaying(true);
    await fetch(`/api/reports/${storedReport.id}/pay`, { method: "POST" });
    window.location.reload();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf7_0%,#fff4f6_100%)] px-4 py-8">
      <section className="xhs-shell mx-auto max-w-4xl rounded-[1.75rem] p-6 md:p-10">
        <div className="inline-flex rounded-full bg-butter px-4 py-2 text-sm font-black">
          你的 14 维度画像已完成
        </div>
        <h1 className="mt-5 text-3xl font-black md:text-5xl">
          {storedReport.report.cover.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-neutral-700">
          {storedReport.report.oneSentenceProfile}
        </p>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {previewTendencies.map((score) => {
            const tendency = getDimensionTendency(score);
            return (
              <div key={score.dimension} className="rounded-3xl bg-rose-50 p-5">
                <p className="text-sm font-black text-rosepop">明显倾向</p>
                <h3 className="mt-2 text-xl font-black">{score.dimensionName}</h3>
                <p className="mt-2 text-2xl font-black">{tendency.sideLabel}</p>
                <p className="mt-2 text-xs font-black text-neutral-500">倾向 {tendency.strength}%</p>
              </div>
            );
          })}
        </div>
        <div className="relative mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-100 to-purple-100 p-6">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 to-transparent" />
          <LockKeyhole className="text-rosepop" />
          <h2 className="mt-3 text-2xl font-black">完整报告已生成，当前为预览版</h2>
          <p className="mt-3 max-h-28 overflow-hidden leading-8 text-neutral-700">
            {storedReport.report.overallSummary}
          </p>
        </div>
        <button
          onClick={pay}
          disabled={paying}
          className="xhs-cta mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-black text-white md:w-auto"
        >
          {paying ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          模拟支付成功，解锁完整报告
        </button>
        <p className="mt-4 text-xs text-neutral-500">
          第一版为开发模拟支付，后续可替换为微信支付、Stripe 或其他支付方式。
        </p>
      </section>
    </main>
  );
}
