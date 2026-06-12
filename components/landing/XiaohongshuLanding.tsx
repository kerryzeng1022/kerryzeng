import { AgentTeaserSection } from "@/components/landing/AgentTeaserSection";
import { DimensionsSection } from "@/components/landing/DimensionsSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LiveHelpCount } from "@/components/landing/LiveHelpCount";
import { PainPointsSection } from "@/components/landing/PainPointsSection";
import { ReportValueSection } from "@/components/landing/ReportValueSection";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { Sparkles, Menu } from "lucide-react";
import Link from "next/link";

const navItems = ["首页", "测评介绍", "报告示例", "用户评价", "深度职业智能体"];

export function XiaohongshuLanding() {
  return (
    <main id="首页" className="min-h-screen overflow-hidden px-0 pb-24 md:px-6 md:pb-10 md:pt-5">
      <div className="mx-auto max-w-7xl overflow-hidden bg-white md:rounded-[2rem] md:border md:border-rose-100 md:shadow-soft">
        <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/92 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-black text-ink">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-rosepop via-coral to-butter text-white shadow-sticker">
                <Sparkles size={19} />
              </span>
              职业天赋挖掘
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-semibold text-neutral-700 md:flex">
              {navItems.map((item) => (
                <a key={item} href={`#${item}`} className="hover:text-rosepop">
                  {item}
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <LiveHelpCount compact />
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft md:hidden">
              <Menu size={20} />
            </button>
          </div>
        </header>

        <HeroSection />
        <section className="xhs-pink-band mx-auto grid max-w-none grid-cols-2 gap-0 border-y border-rose-100/70 px-4 py-3 md:grid-cols-4 md:px-20">
          {["科学测评模型", "14 大维度全面解析", "AI 智能匹配方向", "报告可下载 & 分享"].map(
            (item) => (
              <div
                key={item}
                className="px-3 py-2 text-center text-xs font-black text-neutral-700 md:text-sm"
              >
                {item}
              </div>
            )
          )}
        </section>
        <TestimonialsSection />
        <PainPointsSection />
        <DimensionsSection />
        <ReportValueSection />
        <AgentTeaserSection />
      </div>
      <StickyMobileCTA />
    </main>
  );
}
