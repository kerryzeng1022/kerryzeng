import { ArrowRight, Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = ["1v1 职业追问", "职业路径规划", "简历 & 面试建议", "实时答疑陪伴"];

export function AgentTeaserSection() {
  return (
    <section id="深度职业智能体" className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:pb-14">
      <div className="grid items-center overflow-hidden rounded-[1.75rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-soft md:grid-cols-[1fr_0.85fr]">
        <div className="p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-lilac px-3 py-1 text-xs font-black text-rosepop">
            <Bot size={15} />
            即将开放
          </div>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">深度职业智能体</h2>
          <p className="mt-2 text-xl font-black text-rosepop">即将上线</p>
          <p className="mt-4 max-w-2xl leading-8 text-neutral-700">
            完成基础报告后，你可以继续和职业智能体对话，进一步结合你的经历、学历、城市、收入目标和职业困惑，生成更具体的转型路径。
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <span key={feature} className="rounded-full bg-white px-4 py-3 text-sm font-black shadow-sm">
                {feature}
              </span>
            ))}
          </div>
          <Link href="/agent" className="xhs-cta mt-7 inline-flex items-center gap-2 rounded-full px-7 py-4 font-black text-white">
            抢先体验 <ArrowRight size={18} />
          </Link>
        </div>
        <Image
          src="/images/agent-robot.png"
          alt="深度职业智能体机器人"
          width={960}
          height={640}
          className="h-full min-h-64 w-full object-cover object-right"
        />
      </div>
    </section>
  );
}
