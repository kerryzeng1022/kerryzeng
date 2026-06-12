import type { CareerReport } from "@/lib/types";
import { ensureReadableLength } from "@/lib/report/reportQuality";

export const MIN_FULL_REPORT_CHINESE_CHARS = 5000;

export function reportToText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(reportToText).join("\n");
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(reportToText).join("\n");
  }
  return "";
}

export function countChineseChars(text: string) {
  return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

export function countReportChineseChars(report: CareerReport) {
  return countChineseChars(reportToText(report));
}

export function appendLocalExpansion(report: CareerReport): CareerReport {
  return ensureReadableLength(report);
}
