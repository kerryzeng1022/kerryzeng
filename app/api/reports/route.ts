import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { calculateScores } from "@/lib/scoring";
import { buildReportContext } from "@/lib/report/buildReportContext";
import { generateCareerReport, REPORT_CONTENT_VERSION } from "@/lib/deepseek";
import { saveReport } from "@/lib/report-store";
import type { AnswerMap, BasicInfo } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      basicInfo: BasicInfo;
      answers: AnswerMap;
      calibrationAnswers?: AnswerMap;
      selectedQuestionIds?: string[];
    };
    const scores = calculateScores(body.answers, body.selectedQuestionIds);
    const context = buildReportContext(body.basicInfo, scores, body.calibrationAnswers);
    const { report, chineseCharCount, duplicateAudit } = await generateCareerReport(context);
    const stored = await saveReport({
      id: randomUUID(),
      paid: false,
      createdAt: new Date().toISOString(),
      basicInfo: body.basicInfo,
      selectedQuestionIds: body.selectedQuestionIds,
      calibrationAnswers: body.calibrationAnswers,
      careerCalibration: context.careerCalibration,
      careerMatches: context.careerMatches,
      matchingVersion: 2,
      scores,
      report,
      chineseCharCount,
      duplicateAudit: {
        passed: true,
        scannedSegments: duplicateAudit.scannedSegments,
        checkedAt: new Date().toISOString()
      },
      contentVersion: REPORT_CONTENT_VERSION,
      aiEnhancedAt: process.env.DEEPSEEK_API_KEY ? new Date().toISOString() : undefined
    });

    return NextResponse.json({ id: stored.id, paid: stored.paid });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "报告生成失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
