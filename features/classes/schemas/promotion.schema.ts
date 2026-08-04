import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "ID tidak valid");

export const promoteClassSchema = z
  .object({
    fromClassId: objectId,
    toClassId: objectId,
    /** If omitted, all active students currently in fromClassId are promoted. */
    studentIds: z.array(objectId).optional(),
  })
  .refine((data) => data.fromClassId !== data.toClassId, {
    message: "Kelas asal dan kelas tujuan tidak boleh sama",
    path: ["toClassId"],
  });
export type PromoteClassInput = z.infer<typeof promoteClassSchema>;
