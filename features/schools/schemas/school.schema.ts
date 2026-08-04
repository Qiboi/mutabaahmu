import { z } from "zod";

export const scoreWeightsSchema = z.object({
  prayer: z.number().min(0).max(100),
  sunnahPrayer: z.number().min(0).max(100),
  tilawah: z.number().min(0).max(100),
  murajaah: z.number().min(0).max(100),
  infak: z.number().min(0).max(100),
  helpingParents: z.number().min(0).max(100),
  reading: z.number().min(0).max(100),
  wakeUpEarly: z.number().min(0).max(100),
});

export const createSchoolSchema = z.object({
  name: z.string().trim().min(2, "Nama sekolah minimal 2 karakter").max(160),
  npsn: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  principalName: z.string().trim().optional(),
});
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;

export const updateSchoolSchema = createSchoolSchema.partial().extend({
  settings: z
    .object({
      reportDeadlineHour: z.number().min(0).max(23),
      scoreWeights: scoreWeightsSchema,
    })
    .partial()
    .optional(),
});
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
