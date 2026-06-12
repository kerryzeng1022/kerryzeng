import { ReportRenderer } from "@/components/report/ReportRenderer";
import { getReport } from "@/lib/report-store";
import { notFound } from "next/navigation";

export default async function ReportPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  if (!report) notFound();
  return <ReportRenderer storedReport={report} />;
}
