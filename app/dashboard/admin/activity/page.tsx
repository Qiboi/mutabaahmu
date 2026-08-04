import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { ActivityTimeline } from "@/features/activity-log/components/activity-timeline";

export default async function ActivityLogPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Riwayat Aktivitas">
      <div className="mx-auto max-w-3xl">
        <ActivityTimeline />
      </div>
    </DashboardShell>
  );
}
