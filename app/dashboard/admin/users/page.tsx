import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { DashboardShell } from "@/shared/layout/dashboard-shell";
import { UserList } from "@/features/users/components/user-list";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "school_admin") redirect("/login");

  return (
    <DashboardShell user={session.user} title="Akun Guru & Orang Tua">
      <UserList />
    </DashboardShell>
  );
}
