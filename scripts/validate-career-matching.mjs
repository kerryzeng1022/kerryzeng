import fs from "node:fs/promises";
import path from "node:path";
import { assertNoDuplicateReportText } from "./report-duplicate-audit.mjs";

const baseUrl = process.env.CAREER_TEST_BASE_URL || "http://localhost:3000";
const questionnaire = JSON.parse(
  await fs.readFile(path.join(process.cwd(), "data/questionnaire.json"), "utf8")
);

const calibrationIds = Array.from({ length: 24 }, (_, index) => {
  const prefix = index < 8 ? "ci" : index < 16 ? "cc" : index < 20 ? "ce" : "cw";
  const offset = index < 8 ? index + 1 : index < 16 ? index - 7 : index < 20 ? index - 15 : index - 19;
  return `${prefix}_${String(offset).padStart(2, "0")}`;
});

const profiles = [
  {
    name: "sales",
    dimensions: { income_drive: 5, social_energy: 5, feedback_cycle: 5, recognition_source: 4, pressure_rhythm: 4 },
    calibration: { ci_06: 5, cc_04: 5, cc_02: 4, cw_03: 5 },
    expectedFamily: "sales_business"
  },
  {
    name: "research",
    dimensions: { information_processing: 5, thinking_granularity: 5, drive_logic: 5, social_energy: 1, feedback_cycle: 1 },
    calibration: { ci_05: 5, cc_06: 5, cc_05: 4, ce_04: 5 },
    expectedFamily: "data_research"
  },
  {
    name: "healthcare",
    dimensions: { thinking_granularity: 5, moral_threshold: 5, information_processing: 5, pressure_rhythm: 4 },
    calibration: { ci_01: 5, cc_01: 5, cc_06: 5, ce_01: 5, ce_02: 5, cw_01: 4, cw_04: 5 },
    expectedFamily: "healthcare_clinical",
    expectedConditionalFamily: "healthcare_clinical"
  },
  {
    name: "legal",
    dimensions: { thinking_granularity: 5, information_processing: 5, drive_logic: 5, moral_threshold: 5 },
    calibration: { ci_02: 5, cc_02: 5, cc_06: 5, ce_01: 4, ce_02: 5, cw_04: 5 },
    expectedFamily: "legal_compliance",
    expectedConditionalFamily: "legal_compliance"
  },
  {
    name: "public-safety",
    dimensions: { pressure_rhythm: 5, power_execution: 5, moral_threshold: 5, social_energy: 4, boundary_clarity: 2 },
    calibration: { ci_03: 5, cc_03: 5, ce_02: 5, cw_01: 5, cw_02: 5, cw_03: 5 },
    expectedFamily: "public_safety",
    expectedConditionalFamily: "public_safety"
  },
  {
    name: "middle-signal",
    dimensions: {},
    calibration: {},
    expectNoStrong: true
  }
];

function buildAnswers(dimensionValues) {
  return Object.fromEntries(
    questionnaire.questions.map((question) => {
      const normalized = dimensionValues[question.dimension] ?? 3;
      return [question.id, question.reverse ? 6 - normalized : normalized];
    })
  );
}

function buildCalibrationAnswers(overrides) {
  return Object.fromEntries(calibrationIds.map((id) => [id, overrides[id] ?? 3]));
}

for (const profile of profiles) {
  const response = await fetch(`${baseUrl}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      basicInfo: {
        nickname: `validation-${profile.name}`,
        ageRange: "28-35",
        status: "准备转行",
        occupation: "",
        professionalBackground: "",
        yearsExperience: "0",
        credentials: "",
        city: "测试城市",
        education: "本科",
        biggestConfusion: "验证职业匹配",
        incomeGoal: "找到真实可验证的方向"
      },
      answers: buildAnswers(profile.dimensions),
      calibrationAnswers: buildCalibrationAnswers(profile.calibration),
      selectedQuestionIds: questionnaire.questions.map((question) => question.id)
    })
  });
  if (!response.ok) throw new Error(`${profile.name} API failed: ${response.status}`);
  const { id } = await response.json();
  const reports = JSON.parse(await fs.readFile(path.join(process.cwd(), "reports-store.json"), "utf8"));
  const report = reports.find((item) => item.id === id);
  if (!report?.careerMatches) throw new Error(`${profile.name} has no V2 career matches`);

  const topFamily = report.careerMatches.families[0]?.familyId;
  const conditionalFamilies = report.careerMatches.conditionalRoles.map((role) => role.familyId);
  const hasStrong = report.careerMatches.roles.some((role) => role.status === "strong");
  assertNoDuplicateReportText(report.report);
  if (!report.duplicateAudit?.passed) {
    throw new Error(`${profile.name}: duplicate audit was not stored`);
  }
  if (report.chineseCharCount < 5000) {
    throw new Error(`${profile.name}: report is shorter than 5000 Chinese characters`);
  }

  if (profile.expectedFamily && topFamily !== profile.expectedFamily) {
    throw new Error(`${profile.name}: expected ${profile.expectedFamily}, got ${topFamily}`);
  }
  if (profile.expectedConditionalFamily && !conditionalFamilies.includes(profile.expectedConditionalFamily)) {
    throw new Error(`${profile.name}: missing conditional ${profile.expectedConditionalFamily}`);
  }
  if (profile.expectNoStrong && hasStrong) {
    throw new Error(`${profile.name}: weak evidence unexpectedly produced a strong match`);
  }
  console.log(`${profile.name}: ${topFamily} / conditional=${conditionalFamilies.join(",") || "none"} / id=${id}`);
}

console.log("Career matching V2 validation passed.");

if (process.env.KEEP_VALIDATION_REPORTS !== "1") {
  const storeFile = path.join(process.cwd(), "reports-store.json");
  const storedReports = JSON.parse(await fs.readFile(storeFile, "utf8"));
  await fs.writeFile(
    storeFile,
    JSON.stringify(
      storedReports.filter((report) => !report.basicInfo?.nickname?.startsWith("validation-")),
      null,
      2
    ),
    "utf8"
  );
}
