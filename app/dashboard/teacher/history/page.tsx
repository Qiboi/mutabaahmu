import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { TeacherHistoryView } from "@/features/reports/components/teacher-history-view";

export default async function TeacherHistoryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "teacher") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Riwayat Laporan Siswa">
      <div className="mx-auto max-w-3xl">
        <TeacherHistoryView teacherId={session.user.id} />
      </div>
    </DashboardShell>
  );
}
