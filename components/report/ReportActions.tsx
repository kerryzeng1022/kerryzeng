"use client";

import { ArrowRight, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export function PdfDownloadButton({ onBeforePrint }: { onBeforePrint: () => void }) {
  function handleDownload() {
    onBeforePrint();
    window.setTimeout(() => window.print(), 80);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="no-print inline-flex items-center justify-center gap-2 rounded-full bg-rose-50 px-5 py-3 font-black text-rosepop"
    >
      <Download size={17} />
      下载 PDF
    </button>
  );
}

export function AgentConfirmButton({ reportId }: { reportId: string }) {
  const router = useRouter();

  function handleClick() {
    const shouldContinue = window.confirm(
      "深度职业智能体即将开放，你的报告不会丢失。是否继续查看？"
    );
    if (shouldContinue) {
      router.push(`/agent?fromReport=${encodeURIComponent(reportId)}`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="no-print xhs-cta mt-6 inline-flex items-center gap-2 rounded-full px-6 py-4 font-black text-white"
    >
      解锁深度职业智能体 <ArrowRight size={18} />
    </button>
  );
}
