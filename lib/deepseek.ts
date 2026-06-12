import { buildMockReport } from "@/lib/report/mockReport";
import {
  buildExpansionPrompt,
  buildRepairPrompt,
  buildReportPrompt,
  buildUpgradePrompt,
  REPORT_SYSTEM_PROMPT
} from "@/lib/report/reportPrompt";
import { cleanReportTextFields, ensureReadableLength, reportNeedsAiRepair } from "@/lib/report/reportQuality";
import {
  countReportChineseChars,
  MIN_FULL_REPORT_CHINESE_CHARS
} from "@/lib/report/validateReport";
import type { CareerReport, ReportContext } from "@/lib/types";
import { lockCareerRecommendations } from "@/lib/report/careerRecommendations";
import {
  assertReportHasNoDuplicateText,
  auditReportDuplicates,
  deduplicateReportNarrative
} from "@/lib/report/reportDuplicates";

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";
export const REPORT_CONTENT_VERSION = 9;
const DEFAULT_TIMEOUT_MS = 12000;

function shouldUseFastServerlessFallback() {
  return Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT
  );
}

function parseJsonReport(content: string): CareerReport {
  const trimmed = content.trim();
  const jsonText = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
    : trimmed;
  return JSON.parse(jsonText) as CareerReport;
}

async function callDeepSeek(messages: Array<{ role: "system" | "user"; content: string }>) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const baseURL = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.DEEPSEEK_TIMEOUT_MS || DEFAULT_TIMEOUT_MS));
  const response = await fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.55,
      max_tokens: Number(process.env.DEEPSEEK_MAX_TOKENS || 20000),
      response_format: { type: "json_object" }
    })
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${detail}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek API returned empty content");
  }
  return parseJsonReport(content);
}

export async function generateCareerReport(context: ReportContext) {
  let report: CareerReport;
  let aiReportSucceeded = false;

  if (!process.env.DEEPSEEK_API_KEY || shouldUseFastServerlessFallback()) {
    report = buildMockReport(context);
  } else {
    try {
      report = await callDeepSeek([
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: buildReportPrompt(context) }
      ]);
      aiReportSucceeded = true;
    } catch (error) {
      console.error(error);
      report = buildMockReport(context);
    }
  }

  report = cleanReportTextFields(report);
  let chineseCharCount = countReportChineseChars(report);
  if (
    chineseCharCount < MIN_FULL_REPORT_CHINESE_CHARS &&
    process.env.DEEPSEEK_API_KEY &&
    aiReportSucceeded
  ) {
    try {
      report = await callDeepSeek([
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: buildExpansionPrompt(report, chineseCharCount) }
      ]);
      report = cleanReportTextFields(report);
      chineseCharCount = countReportChineseChars(report);
    } catch (error) {
      console.error(error);
    }
  }

  report = await finalizeCareerReport(report, context, aiReportSucceeded);
  chineseCharCount = countReportChineseChars(report);

  const duplicateAudit = assertReportHasNoDuplicateText(report);
  return { report, chineseCharCount, duplicateAudit };
}

async function finalizeCareerReport(
  report: CareerReport,
  context: ReportContext,
  allowAiRepair: boolean
) {
  let next = ensureReadableLength(cleanReportTextFields(report), context, MIN_FULL_REPORT_CHINESE_CHARS);

  if (
    allowAiRepair &&
    process.env.DEEPSEEK_API_KEY &&
    (reportNeedsAiRepair(next) || !auditReportDuplicates(next).passed)
  ) {
    try {
      next = await callDeepSeek([
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: buildRepairPrompt(context, next) }
      ]);
      next = ensureReadableLength(cleanReportTextFields(next), context, MIN_FULL_REPORT_CHINESE_CHARS);
    } catch (error) {
      console.error(error);
    }
  }

  const completed = ensureReadableLength(
    lockCareerRecommendations(next, context),
    context,
    MIN_FULL_REPORT_CHINESE_CHARS
  );
  return enforceStrictReportQuality(completed, context);
}

function enforceStrictReportQuality(report: CareerReport, context: ReportContext) {
  let strictReport = deduplicateReportNarrative(report);
  let pass = 0;

  while (
    countReportChineseChars(strictReport) < MIN_FULL_REPORT_CHINESE_CHARS &&
    pass < 3
  ) {
    strictReport = deduplicateReportNarrative(
      ensureReadableLength(strictReport, context, MIN_FULL_REPORT_CHINESE_CHARS)
    );
    pass += 1;
  }

  assertReportHasNoDuplicateText(strictReport);
  if (countReportChineseChars(strictReport) < MIN_FULL_REPORT_CHINESE_CHARS) {
    throw new Error("报告严格去重后不足 5000 中文字，已拒绝保存。");
  }
  return strictReport;
}

export async function upgradeExistingCareerReport(
  context: ReportContext,
  existingReport: CareerReport
) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return finalizeCareerReport(existingReport, context, false);
  }

  try {
    const upgraded = await callDeepSeek([
      { role: "system", content: REPORT_SYSTEM_PROMPT },
      { role: "user", content: buildUpgradePrompt(context, existingReport) }
    ]);
    return finalizeCareerReport(upgraded, context, true);
  } catch (error) {
    console.error(error);
    return finalizeCareerReport(existingReport, context, false);
  }
}
