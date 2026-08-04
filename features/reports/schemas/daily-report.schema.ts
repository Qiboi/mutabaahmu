import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "ID tidak valid");

export const prayerItemsSchema = z.object({
  subuh: z.boolean().default(false),
  dzuhur: z.boolean().default(false),
  ashar: z.boolean().default(false),
  maghrib: z.boolean().default(false),
  isya: z.boolean().default(false),
});

export const createDailyReportSchema = z.object({
  studentId: objectId,
  date: z.coerce.date(),
  items: z.object({
    prayers: prayerItemsSchema,
    sunnahPrayer: z.boolean().default(false),
    tilawahPages: z.coerce.number().int().min(0).max(30).default(0),
    murajaahMinutes: z.coerce.number().int().min(0).max(600).default(0),
    infak: z.boolean().default(false),
    helpingParents: z.boolean().default(false),
    readingMinutes: z.coerce.number().int().min(0).max(600).default(0),
    wakeUpEarly: z.boolean().default(false),
    notes: z.string().trim().max(500).optional(),
  }),
});
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;

export const teacherCommentSchema = z.object({
  teacherComment: z.string().trim().min(1, "Komentar tidak boleh kosong").max(500),
});
export type TeacherCommentInput = z.infer<typeof teacherCommentSchema>;

export const listDailyReportQuerySchema = z.object({
  studentId: objectId.optional(),
  classId: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(31),
});
export type ListDailyReportQuery = z.infer<typeof listDailyReportQuerySchema>;
