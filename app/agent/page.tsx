import { Bot, FileText, MessageCircle, Route, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features: Array<[string, LucideIcon]> = [
  ["1v1 职业追问", MessageCircle],
  ["职业路径规划", Route],
  ["简历与面试建议", FileText],
  ["转行风险评估", ShieldAlert]
];

export default function AgentPage({
  searchParams
}: {
  searchParams?: { fromReport?: string };
}) {
  const reportId = searchParams?.fromReport;
  const backHref = reportId ? `/reports/${encodeURIComponent(reportId)}` : "/";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf7_0%,#fff4f6_100%)] px-4 py-10">
      <section className="xhs-shell mx-auto grid max-w-5xl overflow-hidden rounded-[1.75rem] text-center md:grid-cols-[1fr_0.9fr] md:text-left">
        <div className="p-7 md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rosepop text-white">
          <Bot size={32} />
        </div>
        <p className="mt-5 text-sm font-black text-rosepop">即将开放</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">深度职业智能体</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-8 text-neutral-700">
          未来会支持结合你的经历、学历、城市、收入目标、行业选择和转型风险进行 1v1 追问，生成更具体的职业路径。
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {features.map(([title, Icon]) => (
            <div key={title} className="rounded-3xl bg-rose-50 p-5">
              <Icon className="mx-auto text-rosepop" />
              <h2 className="mt-3 font-black">{title}</h2>
            </div>
          ))}
        </div>
        <Link href={backHref} className="xhs-cta mt-8 inline-flex rounded-full px-6 py-4 font-black text-white">
          {reportId ? "返回我的职业报告" : "返回首页"}
        </Link>
        </div>
        <Image
          src="/images/agent-robot.png"
          alt="深度职业智能体机器人"
          width={960}
          height={640}
          className="h-full min-h-80 w-full object-cover object-right"
        />
      </section>
    </main>
  );
}
