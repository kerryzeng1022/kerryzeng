"use client";

import { CareerTrackCard } from "@/components/report/CareerTrackCard";
import { DimensionAxisChart } from "@/components/report/DimensionAxisChart";
import { DimensionCard } from "@/components/report/DimensionCard";
import { LockedReportPreview } from "@/components/report/LockedReportPreview";
import { AgentConfirmButton, PdfDownloadButton } from "@/components/report/ReportActions";
import { Timeline90Days } from "@/components/report/Timeline90Days";
import { buildCareerPersona } from "@/lib/report/careerPersona";
import { buildTendencyIndexMap, getDimensionTendency, sortByTendencyStrength } from "@/lib/report/dimensionAxis";
import { formatTrackRoles, getDisplayMatchScore } from "@/lib/report/reportDisplay";
import type { StoredReport } from "@/lib/types";
import { AlertTriangle, Bot, CalendarCheck, Route, Sparkles, Target, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ReportRenderer({ storedReport }: { storedReport: StoredReport }) {
  const [printMode, setPrintMode] = useState(false);

  if (!storedReport.paid) {
    return <LockedReportPreview storedReport={storedReport} />;
  }

  const report = storedReport.report;
  const strongestTendencies = sortByTendencyStrength(storedReport.scores);
  const top = strongestTendencies.slice(0, 3);
  const centered = [...storedReport.scores]
    .sort((a, b) => getDimensionTendency(a).strength - getDimensionTendency(b).strength)
    .slice(0, 3);
  const dimensionRank = new Map(strongestTendencies.map((score, index) => [score.dimension, index + 1]));
  const tendencyIndexes = buildTendencyIndexMap(storedReport.scores);
  const sortedAnalyses = sortByTendencyStrength(report.dimensionAnalyses);
  const careerPersona = buildCareerPersona(storedReport);
  const topTrack = report.recommendedCareerTracks[0];
  const firstAction = topTrack?.firstStepAction || report.ninetyDayActionPlan.month1;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf7_0%,#fff4f6_100%)] px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="xhs-shell rounded-[1.75rem] p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-butter px-4 py-2 text-sm font-black">
                <Sparkles size={16} />
                完整报告
              </div>
              <h1 className="mt-5 text-4xl font-black md:text-6xl">{report.cover.title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-neutral-700">
                {report.cover.subtitle}
              </p>
              <p className="mt-3 text-sm font-bold text-neutral-500">
                {report.cover.userProfileSummary} · {report.cover.generatedAt}
              </p>
            </div>
            <PdfDownloadButton onBeforePrint={() => setPrintMode(true)} />
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-orange-50 p-6 shadow-soft md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-black text-rosepop">你的职业画像</p>
              <div className="mt-3 inline-flex rounded-full bg-butter px-4 py-2 text-sm font-black text-amber-800">
                {careerPersona.typeName}
              </div>
              <p className="mt-4 rounded-3xl bg-white/75 p-4 text-base font-bold leading-8 text-neutral-800">
                {careerPersona.definition}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {careerPersona.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-white px-3 py-1 text-xs font-black text-rosepop shadow-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-white/80 p-4 shadow-soft">
              <Image
                src={careerPersona.imagePath}
                alt={`${careerPersona.typeName}职业画像插画`}
                width={836}
                height={626}
                className="aspect-[4/3] h-auto w-full rounded-[1.25rem] object-contain object-center"
              />
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <PersonaPanel title="理想职业" content={careerPersona.idealRoles.join(" / ")} />
            <PersonaPanel title="为什么是这些方向" content={careerPersona.idealReason} />
            <PersonaPanel title="先验证什么" content={careerPersona.validationFocus} />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <PlainList title="适合发挥的环境" items={careerPersona.suitableEnvironment} />
            <PlainList title="需要避开的消耗" items={careerPersona.avoidLosses} />
          </div>
        </section>

        <ReportHighlights
          top={top}
          centered={centered}
          track={topTrack}
          firstAction={firstAction}
        />

        <ReportNav />

        <section id="overview" className="grid scroll-mt-24 items-start gap-6 md:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-soft md:p-7">
            <h2 className="text-2xl font-black">14 维度倾向坐标</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              先看粉色点靠左还是靠右，再看它离中线多远。靠左和靠右只是两种做事偏好；离中线越远，说明面试、试岗时越应该优先验证这件事。
            </p>
            <DimensionAxisChart scores={strongestTendencies} />
          </div>
          <div className="grid content-start gap-3">
            <ScoreGroup title="最明显的 3 个倾向" scores={top} tone="strong" tendencyIndexes={tendencyIndexes} />
            <ScoreGroup title="相对居中的 3 项" scores={centered} tone="centered" tendencyIndexes={tendencyIndexes} />
          </div>
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-soft md:p-7">
          <h2 className="text-2xl font-black">总体天赋结构概览</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-700 md:text-base md:leading-8">
            {report.overallSummary}
          </p>
          <p className="mt-4 text-xs font-bold text-neutral-500">
            完整报告中文字符数：{storedReport.chineseCharCount}
          </p>
        </section>

        <section id="tracks" className="scroll-mt-24 space-y-4">
          <div>
            <p className="text-sm font-black text-rosepop">最值得先看的部分</p>
            <h2 className="text-3xl font-black">推荐职业赛道</h2>
          </div>
          {report.recommendedCareerTracks.map((track, index) => (
            <CareerTrackCard key={track.trackName} track={track} rank={index + 1} />
          ))}
        </section>

        {storedReport.careerMatches?.conditionalRoles.length ? (
          <ConditionalCareerSection roles={storedReport.careerMatches.conditionalRoles} />
        ) : null}

        <section id="combinations" className="scroll-mt-24 space-y-4">
          <div>
            <h2 className="text-3xl font-black">组合维度深度分析</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              单个维度只告诉你一部分偏好，组合分析会更接近真实工作里的你：怎么做事、适合什么岗位、哪里会被消耗。
            </p>
          </div>
          {report.coreStrengthCombinations.map((item, index) => (
            <CombinationCard key={item.title} item={item} index={index} />
          ))}
        </section>

        <section id="dimensions" className="scroll-mt-24 space-y-4">
          <div>
            <p className="text-sm font-black text-rosepop">按倾向明显程度排序</p>
            <h2 className="text-3xl font-black">14 个维度逐项分析</h2>
          </div>
          {sortedAnalyses.map((analysis) => (
            <DimensionCard
              key={analysis.dimension}
              analysis={analysis}
              rank={dimensionRank.get(analysis.dimension)}
              tendencyStrength={tendencyIndexes.get(analysis.dimension)}
              forceExpanded={printMode}
            />
          ))}
        </section>

        <section id="risks" className="grid scroll-mt-24 gap-4 md:grid-cols-3">
          {report.careerRiskZones.map((zone) => (
            <article key={zone.title} className="rounded-3xl bg-white p-5 shadow-soft">
              <h3 className="text-xl font-black">{zone.title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-700">{zone.reason}</p>
              <ListBlock items={zone.concreteScenarios ?? zone.typicalScenarios} />
              <ListBlock items={zone.likelyProblems ?? []} tone="risk" />
              <p className="mt-3 text-sm font-bold text-rosepop">{zone.uniqueAvoidAction || zone.avoidSuggestion}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-soft md:p-7">
          <h2 className="text-2xl font-black">不建议优先选择的环境</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {report.notRecommendedEnvironments.map((item) => (
              <article key={item.environment} className="rounded-3xl bg-rose-50 p-5">
                <h3 className="font-black">{item.environment}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-700">{item.reason}</p>
                <ListBlock items={item.avoidRoles ?? []} />
                <ListBlock items={item.likelyProblems ?? []} tone="risk" />
                <ListBlock items={item.howToCheck ?? [item.howToIdentify]} />
              </article>
            ))}
          </div>
        </section>

        <div id="plan" className="scroll-mt-24">
          <Timeline90Days plan={report.ninetyDayActionPlan} />
        </div>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-soft md:p-7">
          <h2 className="text-2xl font-black">最后建议</h2>
          <p className="mt-4 whitespace-pre-line leading-8 text-neutral-700">{report.finalAdvice}</p>
        </section>

        <section className="rounded-[1.75rem] bg-gradient-to-br from-rose-50 via-white to-purple-50 p-6 shadow-soft md:p-8">
          <Bot className="text-rosepop" />
          <h2 className="mt-3 text-2xl font-black">{report.upsellToAgent.title}</h2>
          <p className="mt-3 max-w-3xl leading-8 text-neutral-700">
            {report.upsellToAgent.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {report.upsellToAgent.suggestedQuestions.map((question) => (
              <span key={question} className="rounded-full bg-white px-4 py-2 text-sm font-black">
                {question}
              </span>
            ))}
          </div>
          <AgentConfirmButton reportId={storedReport.id} />
        </section>
      </div>
    </main>
  );
}

function ConditionalCareerSection({
  roles
}: {
  roles: NonNullable<StoredReport["careerMatches"]>["conditionalRoles"];
}) {
  return (
    <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50/70 p-5 md:p-7">
      <p className="text-sm font-black text-amber-800">适配信号存在，但需要先跨过准入门槛</p>
      <h2 className="mt-1 text-2xl font-black">条件性长期方向</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <article key={role.roleId} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-amber-700">{role.familyName}</p>
                <h3 className="mt-1 text-xl font-black">{role.roleTitle}</h3>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                条件性方向
              </span>
            </div>
            <p className="mt-4 text-sm font-bold leading-7 text-neutral-700">{role.why.join("；")}</p>
            <InfoList title="需要先核验" items={role.gaps.length ? role.gaps : role.entryRequirements} />
            <InfoList title="相邻可行岗位" items={role.adjacentRoles} />
            <InfoList title="低成本验证" items={role.validationActions} />
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-black">{title}</h4>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-neutral-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReportHighlights({
  top,
  centered,
  track,
  firstAction
}: {
  top: StoredReport["scores"];
  centered: StoredReport["scores"];
  track: StoredReport["report"]["recommendedCareerTracks"][number] | undefined;
  firstAction: string;
}) {
  const roles = formatTrackRoles(track);
  const displayScore = track ? getDisplayMatchScore(track.matchScore, 1, Boolean(track.scoreBreakdown)) : 0;
  const topQuestions = buildTopQuestions(top);
  const items: Array<{
    title: string;
    content: string;
    icon: LucideIcon;
    tone: string;
  }> = [
    {
      title: "先看具体职业",
      content: roles || track?.trackName || "先选 2-3 个候选岗位验证",
      icon: Target,
      tone: "bg-rose-50 text-rosepop"
    },
    {
      title: "筛岗位问什么",
      content: topQuestions,
      icon: Zap,
      tone: "bg-butter/70 text-amber-700"
    },
    {
      title: "相对居中",
      content: centered.map((item) => `${item.dimensionName}：${getDimensionTendency(item).sideLabel}`).join(" / "),
      icon: AlertTriangle,
      tone: "bg-lilac/80 text-purple-700"
    },
    {
      title: track?.scoreBreakdown ? "匹配可信度" : "推荐指数",
      content: track
        ? `${track.trackName} · ${track.matchLabel ?? `${displayScore}%`}`
        : "先完成 3 个方向访谈",
      icon: Route,
      tone: "bg-skysoft text-sky-700"
    },
    {
      title: "90 天第一步",
      content: firstAction,
      icon: CalendarCheck,
      tone: "bg-mint text-emerald-700"
    }
  ];

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-soft md:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black text-rosepop">先看这 5 点</p>
          <h2 className="text-2xl font-black">快速抓住你的报告重点</h2>
        </div>
        <span className="hidden rounded-full bg-rose-50 px-4 py-2 text-xs font-black text-rosepop md:inline-flex">
          可下载 PDF 保存
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-3xl border border-rose-50 bg-rose-50/35 p-4">
              <span className={`inline-grid h-10 w-10 place-items-center rounded-2xl ${item.tone}`}>
                <Icon size={18} />
              </span>
              <h3 className="mt-3 font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{item.content}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReportNav() {
  const items = [
    ["总览", "#overview"],
    ["赛道", "#tracks"],
    ["组合", "#combinations"],
    ["维度", "#dimensions"],
    ["风险", "#risks"],
    ["计划", "#plan"]
  ];

  return (
    <nav className="sticky top-2 z-30 -mx-1 overflow-x-auto rounded-full border border-rose-100 bg-white/92 p-2 shadow-soft backdrop-blur">
      <div className="flex min-w-max gap-2 px-1">
        {items.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-neutral-700 transition hover:bg-rosepop hover:text-white"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function ScoreGroup({
  title,
  scores,
  tone,
  tendencyIndexes
}: {
  title: string;
  scores: StoredReport["scores"];
  tone: "strong" | "centered";
  tendencyIndexes?: Map<string, number>;
}) {
  return (
    <div className="self-start rounded-[1.5rem] bg-white p-4 shadow-soft">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-3 grid gap-2">
        {scores.map((score) => (
          <div key={score.dimension} className={tone === "strong" ? "rounded-2xl bg-butter/60 p-3" : "rounded-2xl bg-lilac/70 p-3"}>
            <div className="grid grid-cols-[1fr_auto] items-center gap-3 font-black">
              <span className="text-sm">{score.dimensionName}</span>
              <span className="text-sm">{getDimensionTendency(score).sideLabel}</span>
            </div>
            {tendencyIndexes ? (
              <p className="mt-1 text-xs font-black text-rosepop">
                倾向 {tendencyIndexes.get(score.dimension) ?? getDimensionTendency(score).strength}%
              </p>
            ) : null}
            <div className="mt-2 h-1.5 rounded-full bg-white">
              <div
                className="h-full rounded-full bg-rosepop"
                style={{ width: `${tendencyIndexes?.get(score.dimension) ?? getDimensionTendency(score).strength}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CombinationCard({
  item,
  index
}: {
  item: StoredReport["report"]["coreStrengthCombinations"][number];
  index: number;
}) {
  const isPrimary = index === 0;
  return (
    <article
      className={`rounded-[1.75rem] bg-white p-5 shadow-soft md:p-7 ${
        isPrimary ? "border-2 border-rosepop/25" : "border border-rose-50"
      }`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-black text-rosepop">{isPrimary ? "最核心组合" : `组合 ${index + 1}`}</p>
          <h3 className="mt-1 text-2xl font-black">{item.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.suitableScenarios.slice(0, 4).map((scenario) => (
            <span key={scenario} className="rounded-full bg-mint px-3 py-1 text-xs font-black">
              {scenario}
            </span>
          ))}
        </div>
      </div>

      <ReadableSection
        title="先说结论"
        content={item.plainSummary || item.analysis}
        className="mt-5 bg-butter/45"
        strong
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ReadableSection title="你的性格和做事方式" content={item.personalityAnalysis || item.whyItMatters || item.analysis} />
        <ReadableSection title="适合哪些具体职业" content={item.careerFitAnalysis || item.whyItMatters || item.analysis} />
      </div>

      <ListPanel title="岗位日常适配点" items={item.roleFitDetails ?? []} />

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <ReadableSection title="工作方式" content={item.workStyleFit || item.whyItMatters || ""} />
        <ReadableSection title="成长潜力" content={item.growthPotential || item.whyItMatters || ""} />
        <ReadableSection title="不匹配风险" content={item.mismatchWarning || item.riskReminder || ""} className="bg-rose-50" />
      </div>

      <ReadableSection
        title="30 天怎么验证"
        content={item.validationPlan || item.validationTask || item.riskReminder}
        className="mt-4 bg-neutral-50"
        strong
      />
    </article>
  );
}

function ReadableSection({
  title,
  content,
  className = "bg-neutral-50",
  strong = false
}: {
  title: string;
  content: string;
  className?: string;
  strong?: boolean;
}) {
  if (!content) return null;
  return (
    <section className={`rounded-3xl p-4 ${className}`}>
      <h4 className="font-black">{title}</h4>
      <p className={`mt-2 whitespace-pre-line leading-7 text-neutral-700 ${strong ? "text-base font-bold" : "text-sm"}`}>
        {content}
      </p>
    </section>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4 rounded-3xl bg-skysoft p-4">
      <h4 className="font-black">{title}</h4>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {items.map((item) => (
          <p key={item} className="rounded-2xl bg-white/80 p-3 text-sm font-bold leading-6 text-neutral-700">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function buildTopQuestions(top: StoredReport["scores"]) {
  const dimensions = top.map((item) => item.dimension);
  const questions = [
    dimensions.includes("power_execution") ? "这个岗位谁拍板、你能决定什么" : "",
    dimensions.includes("boundary_clarity") ? "下班后是否长期待命" : "",
    dimensions.includes("social_energy") ? "一周会议和客户沟通占多少" : "",
    dimensions.includes("income_drive") ? "收入结构和涨薪规则怎么算" : "",
    dimensions.includes("moral_threshold") ? "有没有灰色操作或背锅风险" : "",
    dimensions.includes("feedback_cycle") ? "做完多久能看到反馈" : ""
  ].filter(Boolean);
  return (questions.length ? questions : top.map((item) => `${item.dimensionName}看日常任务`)).slice(0, 3).join("；");
}

function PlainList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
      <h3 className="font-black text-rosepop">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-neutral-700">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function PersonaPanel({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
      <h3 className="font-black text-rosepop">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-7 text-neutral-700">{content}</p>
    </div>
  );
}

function ListBlock({ items, tone = "normal" }: { items: string[]; tone?: "normal" | "risk" }) {
  if (!items.length) return null;
  return (
    <ul className={`mt-3 space-y-2 text-xs leading-5 ${tone === "risk" ? "font-bold text-rosepop" : "text-neutral-700"}`}>
      {items.map((item) => (
        <li key={item}>• {item}</li>
      ))}
    </ul>
  );
}
