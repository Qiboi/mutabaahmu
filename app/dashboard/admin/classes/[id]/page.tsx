import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { ClassDetailView } from "@/features/classes/components/class-detail-view";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  const { id } = await params;

  return (
    <DashboardShell user={session.user} title="Detail Kelas">
      <ClassDetailView classId={id} />
    </DashboardShell>
  );
}
