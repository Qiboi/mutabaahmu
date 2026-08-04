import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { StudentList } from "@/features/students/components/student-list";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Manajemen Siswa">
      <StudentList />
    </DashboardShell>
  );
}
