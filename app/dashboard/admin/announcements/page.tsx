import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { AnnouncementForm } from "@/features/announcements/components/announcement-form";
import { AnnouncementList } from "@/features/announcements/components/announcement-list";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Pengumuman">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Riwayat Pengumuman</h2>
          <AnnouncementList />
        </div>
        <AnnouncementForm />
      </div>
    </DashboardShell>
  );
}
