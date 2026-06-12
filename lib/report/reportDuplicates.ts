import type { CareerReport } from "@/lib/types";

const MIN_SEGMENT_LENGTH = 16;
const SHINGLE_LENGTH = 14;

const ignoredPathParts = new Set([
  "cover",
  "title",
  "subtitle",
  "generatedAt",
  "userProfileSummary",
  "dimension",
  "dimensionName",
  "scoreLevel",
  "trackName",
  "matchLabel",
  "matchStatus",
  "scoreBreakdown",
  "roleDetails",
  "suitableRoles",
  "relatedDimensions",
  "suitableScenarios",
  "environment",
  "roleId",
  "roleTitle",
  "familyId",
  "familyName"
]);

export type ReportDuplicateIssue = {
  duplicatePath: string;
  originalPath: string;
  repeatedText: string;
};

export type ReportDuplicateAudit = {
  passed: boolean;
  scannedSegments: number;
  duplicateSegments: number;
  issues: ReportDuplicateIssue[];
};

type SegmentRecord = {
  path: string;
  text: string;
};

type DuplicateIndex = {
  exact: Map<string, SegmentRecord>;
  shingles: Map<string, SegmentRecord>;
  scannedSegments: number;
};

function normalizeDuplicateText(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(
      /[\s，。！？、；：,.!?;:'"“”‘’（）()【】\[\]<>《》\-—_\/\\0-9]/g,
      ""
    );
}

function splitNarrativeSentences(text: string) {
  return text.match(/[^。！？!?；;\n]+[。！？!?；;]?/g) ?? [text];
}

function pathIsNarrative(path: string[]) {
  return !path.some((part) => ignoredPathParts.has(part));
}

function shingles(value: string) {
  if (value.length < SHINGLE_LENGTH) return [];
  const result: string[] = [];
  for (let index = 0; index <= value.length - SHINGLE_LENGTH; index += 1) {
    result.push(value.slice(index, index + SHINGLE_LENGTH));
  }
  return result;
}

function createIndex(): DuplicateIndex {
  return {
    exact: new Map(),
    shingles: new Map(),
    scannedSegments: 0
  };
}

function findDuplicate(
  index: DuplicateIndex,
  text: string,
  path: string
): SegmentRecord | null {
  const normalized = normalizeDuplicateText(text);
  if (normalized.length < MIN_SEGMENT_LENGTH) return null;
  index.scannedSegments += 1;

  const exact = index.exact.get(normalized);
  if (exact) return exact;

  const localShingles = new Set<string>();
  for (const shingle of shingles(normalized)) {
    if (localShingles.has(shingle)) return { path, text: text.trim() };
    localShingles.add(shingle);
    const original = index.shingles.get(shingle);
    if (original) return original;
  }

  const record = { path, text: text.trim() };
  index.exact.set(normalized, record);
  for (const shingle of shingles(normalized)) {
    if (!index.shingles.has(shingle)) index.shingles.set(shingle, record);
  }
  return null;
}

function walkNarrativeStrings(
  value: unknown,
  visitor: (path: string[], text: string) => void,
  path: string[] = []
) {
  if (typeof value === "string") {
    if (pathIsNarrative(path)) visitor(path, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkNarrativeStrings(item, visitor, [...path, String(index)]));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) =>
      walkNarrativeStrings(entry, visitor, [...path, key])
    );
  }
}

export function auditReportDuplicates(report: CareerReport): ReportDuplicateAudit {
  const index = createIndex();
  const issues: ReportDuplicateIssue[] = [];

  walkNarrativeStrings(report, (path, text) => {
    for (const sentence of splitNarrativeSentences(text)) {
      const original = findDuplicate(index, sentence.trim(), path.join("."));
      if (!original) continue;
      issues.push({
        duplicatePath: path.join("."),
        originalPath: original.path,
        repeatedText: sentence.trim()
      });
    }
  });

  return {
    passed: issues.length === 0,
    scannedSegments: index.scannedSegments,
    duplicateSegments: issues.length,
    issues: issues.slice(0, 20)
  };
}

function deduplicateValue(
  value: unknown,
  index: DuplicateIndex,
  path: string[] = []
): unknown {
  if (typeof value === "string") {
    if (!pathIsNarrative(path)) return value;
    const paragraphs = value
      .split(/\n{2,}/)
      .map((paragraph) =>
        splitNarrativeSentences(paragraph)
          .map((sentence) => sentence.trim())
          .filter(Boolean)
          .filter((sentence) => !findDuplicate(index, sentence, path.join(".")))
          .join("")
      )
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    return paragraphs.join("\n\n");
  }
  if (Array.isArray(value)) {
    return value
      .map((item, itemIndex) => deduplicateValue(item, index, [...path, String(itemIndex)]))
      .filter((item) => item !== "");
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        deduplicateValue(entry, index, [...path, key])
      ])
    );
  }
  return value;
}

export function deduplicateReportNarrative(report: CareerReport): CareerReport {
  return deduplicateValue(report, createIndex()) as CareerReport;
}

export function assertReportHasNoDuplicateText(report: CareerReport) {
  const audit = auditReportDuplicates(report);
  if (!audit.passed) {
    const details = audit.issues
      .slice(0, 5)
      .map((issue) => `${issue.duplicatePath} 重复 ${issue.originalPath}`)
      .join("；");
    throw new Error(`报告重复内容校验失败：${details}`);
  }
  return audit;
}
