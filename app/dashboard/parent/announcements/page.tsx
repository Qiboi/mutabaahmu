import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { AnnouncementList } from "@/features/announcements/components/announcement-list";

export default async function ParentAnnouncementsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "parent") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Pengumuman Sekolah">
      <div className="mx-auto max-w-2xl">
        <AnnouncementList />
      </div>
    </DashboardShell>
  );
}
