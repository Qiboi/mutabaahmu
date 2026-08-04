import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { ParentOverview } from "@/features/students/components/parent-overview";

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "parent") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Dashboard Orang Tua">
      <ParentOverview />
    </DashboardShell>
  );
}
