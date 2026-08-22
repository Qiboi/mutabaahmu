import { z } from "zod";
import { SURAH_MAP } from "@/constants/surah";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "ID tidak valid");

export const prayerItemsSchema = z.object({
  subuh: z.boolean().default(false),
  dzuhur: z.boolean().default(false),
  ashar: z.boolean().default(false),
  maghrib: z.boolean().default(false),
  isya: z.boolean().default(false),
});

/** One tilawah/murajaah session: a surah + ayat range. Validated against SURAH_MAP so a
 *  student can't be recorded reading past the actual number of ayat in that surah. */
export const quranSessionSchema = z
  .object({
    surahNumber: z.coerce.number().int().min(1, "Surat wajib dipilih").max(114),
    surahName: z.string().trim().min(1, "Nama surat tidak valid"),
    ayatFrom: z.coerce.number().int().min(1, "Ayat awal minimal 1"),
    ayatTo: z.coerce.number().int().min(1, "Ayat akhir minimal 1"),
  })
  .refine((data) => data.ayatTo >= data.ayatFrom, {
    message: "Ayat akhir harus sama atau lebih besar dari ayat awal",
    path: ["ayatTo"],
  })
  .refine(
    (data) => {
      const surah = SURAH_MAP.get(data.surahNumber);
      return !surah || data.ayatTo <= surah.totalAyat;
    },
    { message: "Ayat melebihi jumlah ayat surat ini", path: ["ayatTo"] },
  );
export type QuranSessionInput = z.infer<typeof quranSessionSchema>;

export const createDailyReportSchema = z
  .object({
    studentId: objectId,
    date: z.coerce.date(),
    items: z.object({
      prayers: prayerItemsSchema,
      sunnahPrayer: z.boolean().default(false),
      tilawahPages: z.coerce.number().int().min(0).max(30).default(0),
      tilawahDetails: z.array(quranSessionSchema).max(10, "Maksimal 10 rincian surat per hari").default([]),
      murajaahMinutes: z.coerce.number().int().min(0).max(600).default(0),
      murajaahDetails: z.array(quranSessionSchema).max(10, "Maksimal 10 rincian surat per hari").default([]),
      infak: z.boolean().default(false),
      helpingParents: z.boolean().default(false),
      readingMinutes: z.coerce.number().int().min(0).max(600).default(0),
      bookTitle: z.string().trim().max(200).optional(),
      wakeUpEarly: z.boolean().default(false),
      notes: z.string().trim().max(500).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { items } = data;

    if (items.tilawahPages > 0 && items.tilawahDetails.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rincian surat tilawah wajib diisi karena ada halaman tilawah",
        path: ["items", "tilawahDetails"],
      });
    }

    if (items.murajaahMinutes > 0 && items.murajaahDetails.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rincian surat murajaah wajib diisi karena ada durasi murajaah",
        path: ["items", "murajaahDetails"],
      });
    }

    if (items.readingMinutes > 0 && !items.bookTitle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Judul buku wajib diisi karena ada durasi membaca",
        path: ["items", "bookTitle"],
      });
    }
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