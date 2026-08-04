import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().trim().min(2, "Nama kelas minimal 2 karakter").max(80),
  grade: z.coerce.number().int().min(1).max(6),
  academicYearId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  homeroomTeacherId: z.string().optional().nullable(),
  teacherIds: z.array(z.string()).default([]),
});
export type CreateClassInput = z.infer<typeof createClassSchema>;

export const updateClassSchema = createClassSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateClassInput = z.infer<typeof updateClassSchema>;

export const listClassQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  academicYearId: z.string().optional(),
  grade: z.coerce.number().int().optional(),
});
export type ListClassQuery = z.infer<typeof listClassQuerySchema>;
