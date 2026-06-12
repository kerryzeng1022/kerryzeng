import fs from "node:fs/promises";
import path from "node:path";
import { auditReportText } from "./report-duplicate-audit.mjs";

const storeFile = path.join(process.cwd(), "reports-store.json");
const reports = JSON.parse(await fs.readFile(storeFile, "utf8"));
let failed = false;

for (const report of reports) {
  const issues = auditReportText(report.report);
  const lengthPassed = report.chineseCharCount >= 5000;
  const passed = issues.length === 0 && lengthPassed && report.duplicateAudit?.passed;
  console.log(
    `${passed ? "PASS" : "FAIL"} ${report.id} ${report.basicInfo?.nickname ?? ""} chars=${report.chineseCharCount} duplicates=${issues.length}`
  );
  if (!passed) {
    failed = true;
    if (issues[0]) {
      console.log(`  ${issues[0].currentPath} repeats ${issues[0].originalPath}`);
    }
  }
}

if (failed) process.exitCode = 1;
