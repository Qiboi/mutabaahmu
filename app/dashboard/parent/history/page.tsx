import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { ParentHistoryView } from "@/features/reports/components/parent-history-view";

export default async function ParentHistoryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "parent") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Riwayat Laporan">
      <div className="mx-auto max-w-3xl">
        <ParentHistoryView />
      </div>
    </DashboardShell>
  );
}
