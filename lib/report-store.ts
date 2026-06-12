import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getStore } from "@netlify/blobs";
import { REPORT_CONTENT_VERSION, upgradeExistingCareerReport } from "@/lib/deepseek";
import { buildReportContext } from "@/lib/report/buildReportContext";
import { countReportChineseChars } from "@/lib/report/validateReport";
import { cleanReportTextFields, ensureReadableLength } from "@/lib/report/reportQuality";
import type { StoredReport } from "@/lib/types";
import {
  assertReportHasNoDuplicateText,
  auditReportDuplicates,
  deduplicateReportNarrative
} from "@/lib/report/reportDuplicates";

const storePath = path.join(process.cwd(), "reports-store.json");
const blobStoreName = "jobseek-reports";
let fileStoreQueue: Promise<void> = Promise.resolve();

function shouldUseBlobStore() {
  return Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
}

function getReportBlobStore() {
  return getStore(blobStoreName, { consistency: "strong" });
}

async function readFileStore(): Promise<StoredReport[]> {
  try {
    const raw = await fs.readFile(storePath, "utf-8");
    return JSON.parse(raw) as StoredReport[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeFileStore(reports: StoredReport[]) {
  const temporaryPath = `${storePath}.${randomUUID()}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(reports, null, 2), "utf-8");
  await fs.rename(temporaryPath, storePath);
}

function withFileStoreLock<T>(operation: () => Promise<T>) {
  const result = fileStoreQueue.then(operation, operation);
  fileStoreQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

export async function saveReport(report: StoredReport) {
  const storedReport =
    report.matchingVersion === 2
      ? withDuplicateAudit(report, assertReportHasNoDuplicateText(report.report).scannedSegments)
      : report;

  if (shouldUseBlobStore()) {
    await getReportBlobStore().setJSON(storedReport.id, storedReport);
    return storedReport;
  }

  return withFileStoreLock(async () => {
    const reports = await readFileStore();
    await writeFileStore([
      storedReport,
      ...reports.filter((item) => item.id !== storedReport.id)
    ]);
    return storedReport;
  });
}

export async function getReport(id: string) {
  if (shouldUseBlobStore()) {
    const report = (await getReportBlobStore().get(id, { type: "json" })) as StoredReport | null;
    if (!report) return null;
    const hydrated = await hydrateStoredReport(report);
    if (hydrated !== report) {
      await getReportBlobStore().setJSON(id, hydrated);
    }
    return hydrated;
  }

  return withFileStoreLock(async () => {
    const reports = await readFileStore();
    const reportIndex = reports.findIndex((item) => item.id === id);
    const report = reports[reportIndex];
    if (!report) return null;

    const hydrated = await hydrateStoredReport(report);
    if (hydrated !== report) {
      reports[reportIndex] = hydrated;
      await writeFileStore(reports);
    }
    return hydrated;
  });
}

async function hydrateStoredReport(report: StoredReport) {
  if (
    report.duplicateAudit?.passed &&
    report.chineseCharCount >= 5000 &&
    auditReportDuplicates(report.report).passed
  ) {
    return report;
  }

  if (
    report.matchingVersion === 2 &&
    report.paid &&
    (report.contentVersion ?? 1) < REPORT_CONTENT_VERSION
  ) {
    const context = buildReportContext(report.basicInfo, report.scores, report.calibrationAnswers);
    const upgradedReport = await upgradeExistingCareerReport(context, report.report);
    const upgradedCount = countReportChineseChars(upgradedReport);
    const audit = assertReportHasNoDuplicateText(upgradedReport);
    return {
      ...report,
      report: upgradedReport,
      chineseCharCount: upgradedCount,
      duplicateAudit: {
        passed: true,
        scannedSegments: audit.scannedSegments,
        checkedAt: new Date().toISOString()
      },
      contentVersion: REPORT_CONTENT_VERSION,
      aiEnhancedAt: process.env.DEEPSEEK_API_KEY ? new Date().toISOString() : report.aiEnhancedAt,
      aiEnhancementFailedAt: process.env.DEEPSEEK_API_KEY ? report.aiEnhancementFailedAt : new Date().toISOString()
    };
  }

  const context = buildReportContext(report.basicInfo, report.scores, report.calibrationAnswers);
  const cleanedReport = enforceStoredReportQuality(report.report, context);
  const audit = assertReportHasNoDuplicateText(cleanedReport);
  return {
    ...report,
    report: cleanedReport,
    chineseCharCount: countReportChineseChars(cleanedReport),
    duplicateAudit: {
      passed: true,
      scannedSegments: audit.scannedSegments,
      checkedAt: new Date().toISOString()
    }
  };
}

function enforceStoredReportQuality(
  report: StoredReport["report"],
  context: ReturnType<typeof buildReportContext>
) {
  let strictReport = deduplicateReportNarrative(
    ensureReadableLength(cleanReportTextFields(report), context)
  );
  let pass = 0;
  while (countReportChineseChars(strictReport) < 5000 && pass < 3) {
    strictReport = deduplicateReportNarrative(
      ensureReadableLength(strictReport, context, 5000)
    );
    pass += 1;
  }
  assertReportHasNoDuplicateText(strictReport);
  if (countReportChineseChars(strictReport) < 5000) {
    throw new Error("报告严格去重后不足 5000 中文字，已拒绝展示。");
  }
  return strictReport;
}

function withDuplicateAudit(report: StoredReport, scannedSegments: number): StoredReport {
  return {
    ...report,
    duplicateAudit: {
      passed: true,
      scannedSegments,
      checkedAt: new Date().toISOString()
    }
  };
}

export async function getReportCount() {
  if (shouldUseBlobStore()) {
    const { blobs } = await getReportBlobStore().list();
    return blobs.length;
  }

  const reports = await readFileStore();
  return reports.length;
}

export async function markReportPaid(id: string) {
  if (shouldUseBlobStore()) {
    const report = (await getReportBlobStore().get(id, { type: "json" })) as StoredReport | null;
    if (!report) return null;
    const paidReport = { ...report, paid: true };
    await getReportBlobStore().setJSON(id, paidReport);
    return paidReport;
  }

  return withFileStoreLock(async () => {
    const reports = await readFileStore();
    const report = reports.find((item) => item.id === id);
    if (!report) return null;
    report.paid = true;
    await writeFileStore(reports);
    return report;
  });
}
