import { z } from "zod";
import { SEMESTERS } from "@/constants/semester";

export const createAcademicYearSchema = z
  .object({
    label: z.string().trim().regex(/^\d{4}\/\d{4}$/, "Format harus YYYY/YYYY, contoh 2025/2026"),
    semester: z.enum(SEMESTERS),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endDate"],
  });
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
