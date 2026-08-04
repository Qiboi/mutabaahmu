import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { TeacherReportList } from "@/features/reports/components/teacher-report-list";

export default async function TeacherDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "teacher") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Dashboard Guru">
      <TeacherReportList teacherId={session.user.id} />
    </DashboardShell>
  );
}
