import { ArrowRight, Clock3 } from "lucide-react";
import { LiveHelpCount } from "@/components/landing/LiveHelpCount";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-5 px-4 pb-7 pt-7 md:grid-cols-[1.12fr_0.88fr] md:gap-6 md:px-8 md:pb-9 md:pt-10">
      <div className="relative z-10">
        <h1 className="text-[2.42rem] font-black leading-[1.08] tracking-normal text-ink sm:text-[3rem] md:text-[4rem] lg:text-[4.25rem]">
          你不是废，
          <br />
          你只是还没找到
          <br />
          适合自己的
          <span className="paint-underline inline-block whitespace-nowrap bg-clip-text text-rosepop">
            职业赛道
          </span>
        </h1>
        <p className="mt-5 flex max-w-xl items-start gap-2 text-base font-semibold leading-7 text-neutral-700 md:text-lg">
          <Clock3 className="mt-1 shrink-0 text-neutral-800" size={19} />
          <span>
            花 <b className="text-rosepop">10 分钟</b>，测出你的职业天赋、能量消耗点和适合方向
          </span>
        </p>
        <div className="mt-6 flex flex-col gap-4 md:mt-8 md:flex-row md:items-center">
          <Link
            href="/questionnaire"
            className="xhs-cta hidden items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-black text-white transition hover:-translate-y-0.5 md:inline-flex md:min-w-72"
          >
            开始测一测 <ArrowRight size={19} />
          </Link>
          <LiveHelpCount />
        </div>
      </div>

      <div className="relative min-h-[235px] md:min-h-[400px]">
        <div className="absolute right-4 top-2 z-10 hidden rotate-[-8deg] text-sm font-black text-neutral-700 md:block">
          找到热爱
          <br />
          做自己喜欢的事！
        </div>
        <Image
          src="/images/hero-report-card.png"
          alt="职业天赋报告插画"
          width={960}
          height={640}
          priority
          className="mx-auto w-full max-w-[560px] object-contain drop-shadow-[0_24px_45px_rgba(244,63,114,0.12)]"
        />
      </div>
    </section>
  );
}
