import { z } from "zod";
import { GENDERS } from "@/constants/gender";

export const createStudentSchema = z.object({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(160),
  nisn: z.string().trim().optional(),
  gender: z.enum(GENDERS),
  dateOfBirth: z.coerce.date().optional(),
  classId: z.string().min(1, "Kelas wajib dipilih"),
  parentIds: z.array(z.string()).default([]),
});
export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = createStudentSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const listStudentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  classId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
export type ListStudentQuery = z.infer<typeof listStudentQuerySchema>;
