import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { AcademicYearList } from "@/features/schools/components/academic-year-list";

export default async function AcademicYearsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Tahun Ajaran">
      <AcademicYearList />
    </DashboardShell>
  );
}
