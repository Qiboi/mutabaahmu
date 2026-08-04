import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { SchoolSettingsForm } from "@/features/schools/components/school-settings-form";

export default async function SchoolSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Pengaturan Sekolah">
      <div className="mx-auto max-w-2xl">
        <SchoolSettingsForm />
      </div>
    </DashboardShell>
  );
}
