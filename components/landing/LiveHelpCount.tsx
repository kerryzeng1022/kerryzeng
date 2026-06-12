"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

type StatsPayload = {
  helpedCount: number;
  questionnaireStarts?: number;
  reportCount: number;
  updatedAt: string;
};

const fallbackCount = 0;

export function LiveHelpCount({ compact = false }: { compact?: boolean }) {
  const [stats, setStats] = useState<StatsPayload>({
    helpedCount: fallbackCount,
    reportCount: 0,
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch("/api/stats", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as StatsPayload;
        if (active) setStats(payload);
      } catch {
        // Keep the fallback count visible when local dev server is warming up.
      }
    }

    void loadStats();
    const timer = window.setInterval(loadStats, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const formatted = stats.helpedCount.toLocaleString("zh-CN");

  if (compact) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-2 text-sm font-bold text-rosepop">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]" />
        {formatted} 人已开始
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-[0_10px_30px_rgba(255,75,106,0.1)]">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-rosepop">
        <Users size={17} />
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-black text-emerald-500">真实统计</span>
        <span className="text-sm font-black text-neutral-700">
          已有 {formatted} 人开始测评
        </span>
      </span>
    </div>
  );
}
