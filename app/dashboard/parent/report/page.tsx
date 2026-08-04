import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { DailyReportForm } from "@/features/reports/components/daily-report-form";

export default async function ParentReportPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "parent") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Isi Laporan Harian">
      <div className="mx-auto max-w-3xl">
        <DailyReportForm />
      </div>
    </DashboardShell>
  );
}
