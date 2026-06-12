import { NextResponse } from "next/server";
import { getReportCount } from "@/lib/report-store";
import { getQuestionnaireStats, incrementQuestionnaireStarts } from "@/lib/stats-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [reportCount, stats] = await Promise.all([
    getReportCount(),
    getQuestionnaireStats()
  ]);

  return NextResponse.json(
    {
      helpedCount: stats.questionnaireStarts,
      questionnaireStarts: stats.questionnaireStarts,
      reportCount,
      updatedAt: stats.updatedAt
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

export async function POST() {
  const [reportCount, stats] = await Promise.all([
    getReportCount(),
    incrementQuestionnaireStarts()
  ]);

  return NextResponse.json(
    {
      helpedCount: stats.questionnaireStarts,
      questionnaireStarts: stats.questionnaireStarts,
      reportCount,
      updatedAt: stats.updatedAt
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
