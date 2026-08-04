import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { ClassPromotionView } from "@/features/classes/components/class-promotion-view";

export default async function ClassPromotionPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Kenaikan Kelas">
      <div className="mx-auto max-w-2xl">
        <ClassPromotionView />
      </div>
    </DashboardShell>
  );
}
