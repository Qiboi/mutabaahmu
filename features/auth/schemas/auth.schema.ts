import { z } from "zod";
import { ALL_ROLES } from "@/constants/roles";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
    email: z.string().trim().toLowerCase().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(8),
    role: z.enum(ALL_ROLES as [string, ...string[]]),
    phone: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;
