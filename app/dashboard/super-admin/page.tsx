import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";

export default async function SuperAdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "super_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Ringkasan Seluruh Sekolah">
      <AdminDashboard />
    </DashboardShell>
  );
}
