import type { Role, UserStatus } from "@/constants/roles";
import type { JWT } from "next-auth/jwt";

/** Consistent API envelope used by every Route Handler in the app. */
export type ApiResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Shape exposed on the Auth.js session (see features/auth). */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  schoolId?: string | null;
  avatarUrl?: string | null;
}

declare module "@auth/core/types" {
  interface Session {
    user: SessionUser;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging requires an interface here
  interface User extends SessionUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends Record<string, unknown> {
    user: SessionUser;
  }
}

// Keeps the `JWT` import from being flagged as unused while satisfying the augmentation above.
export type { JWT };
