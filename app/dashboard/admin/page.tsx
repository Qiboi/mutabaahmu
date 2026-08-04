import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";

export default async function SchoolAdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Dashboard Admin Sekolah">
      <AdminDashboard />
    </DashboardShell>
  );
}
