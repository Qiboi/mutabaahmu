import type { IUser } from "@/models/User";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: IUser["role"];
  status: IUser["status"];
  phone?: string;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

/**
 * Defense-in-depth: explicitly whitelists fields instead of returning the raw Mongoose document.
 * `passwordHash` has `select: false` in the schema, but that only suppresses it for documents
 * obtained via a real query (find/findById/findByIdAndUpdate) — a document returned directly
 * from `Model.create()` still has it in memory and would otherwise leak through `toJSON()`.
 * Using an explicit DTO here means the leak risk doesn't depend on which Mongoose method produced
 * the document.
 */
export function toUserDTO(user: IUser): UserDTO {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    avatarUrl: user.avatarUrl ?? null,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}
