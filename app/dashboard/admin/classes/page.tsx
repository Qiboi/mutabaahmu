import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { ClassList } from "@/features/classes/components/class-list";

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Manajemen Kelas">
      <ClassList />
    </DashboardShell>
  );
}
