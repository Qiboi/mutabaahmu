import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { ROLE_HOME, type Role } from "@/constants/roles";

export default async function DashboardIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(ROLE_HOME[session.user.role as Role]);
}
