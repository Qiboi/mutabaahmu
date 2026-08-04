import { auth } from "@/lib/auth/auth";
import type { Role } from "@/constants/roles";
import type { SessionUser } from "@/types";

export class ForbiddenError extends Error {}
export class UnauthorizedError extends Error {}

/** Ensures a session exists and (optionally) that its role is in the allow-list. Throws otherwise. */
export async function requireUser(allowedRoles?: Role[]): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError("Anda harus login");
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError("Anda tidak memiliki akses untuk aksi ini");
  }
  return session.user;
}
