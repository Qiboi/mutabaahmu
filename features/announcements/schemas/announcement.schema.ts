import { z } from "zod";
import { ANNOUNCEMENT_AUDIENCES } from "@/constants/announcement";

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter").max(160),
  body: z.string().trim().min(2, "Isi pengumuman minimal 2 karakter").max(4000),
  audience: z.enum(ANNOUNCEMENT_AUDIENCES),
  classId: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
