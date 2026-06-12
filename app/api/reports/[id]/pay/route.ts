import { NextResponse } from "next/server";
import { markReportPaid } from "@/lib/report-store";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const report = await markReportPaid(params.id);
  if (!report) {
    return NextResponse.json({ message: "报告不存在" }, { status: 404 });
  }
  return NextResponse.json({ id: report.id, paid: report.paid });
}
