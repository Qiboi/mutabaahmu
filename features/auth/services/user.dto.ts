import type { IUser } from "@/models/User";
import type { SessionUser } from "@/types";

/** DTO Pattern: strips sensitive fields (passwordHash) before returning to callers. */
export function toSessionUser(user: IUser): SessionUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    schoolId: user.schoolId ? user.schoolId.toString() : null,
    avatarUrl: user.avatarUrl ?? null,
  };
}
