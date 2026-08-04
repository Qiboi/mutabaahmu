import { z } from "zod";
import { ROLES } from "@/constants/roles";

const MANAGEABLE_ROLES = [ROLES.TEACHER, ROLES.PARENT] as const;

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(MANAGEABLE_ROLES),
  phone: z.string().trim().optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120).optional(),
  email: z.string().trim().toLowerCase().email("Format email tidak valid").optional(),
  phone: z.string().trim().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  password: z
    .union([z.string().min(8, "Password minimal 8 karakter"), z.literal("")])
    .optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const listUserQuerySchema = z.object({
  role: z.enum(MANAGEABLE_ROLES).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListUserQuery = z.infer<typeof listUserQuerySchema>;
