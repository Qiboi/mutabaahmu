import { classRepository } from "@/repositories/class.repository";
import { studentRepository } from "@/repositories/student.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import type { PromoteClassInput } from "../schemas/promotion.schema";

export class PromotionError extends Error {}

export const promotionService = {
  async promote(input: PromoteClassInput, actorId: string) {
    const [fromClass, toClass] = await Promise.all([
      classRepository.findById(input.fromClassId),
      classRepository.findById(input.toClassId),
    ]);
    if (!fromClass) throw new PromotionError("Kelas asal tidak ditemukan");
    if (!toClass) throw new PromotionError("Kelas tujuan tidak ditemukan");

    // Default to every active student currently in the source class.
    const candidateIds =
      input.studentIds && input.studentIds.length > 0
        ? input.studentIds
        : await studentRepository.findAllActiveIdsByClass(input.fromClassId);

    if (candidateIds.length === 0) {
      throw new PromotionError("Tidak ada siswa untuk dipindahkan");
    }

    // Integrity check: never trust the client blindly — confirm every id actually belongs to
    // fromClassId, so a stale/incorrect selection can't accidentally move the wrong students.
    const actualMemberIds = new Set(await studentRepository.findAllActiveIdsByClass(input.fromClassId));
    const validIds = candidateIds.filter((id) => actualMemberIds.has(id));
    if (validIds.length === 0) {
      throw new PromotionError("Siswa yang dipilih tidak lagi berada di kelas asal");
    }

    const movedCount = await studentRepository.bulkMoveClass(validIds, input.toClassId);

    await Promise.all([
      classRepository.recomputeStudentCount(input.fromClassId),
      classRepository.recomputeStudentCount(input.toClassId),
    ]);

    await activityLogRepository.record({
      actorId,
      action: "promote_class",
      entityType: "ClassRoom",
      entityId: input.toClassId,
      description: `Memindahkan ${movedCount} siswa dari kelas "${fromClass.name}" ke "${toClass.name}"`,
      metadata: { fromClassId: input.fromClassId, toClassId: input.toClassId, studentIds: validIds },
    });

    return { movedCount, fromClassName: fromClass.name, toClassName: toClass.name };
  },
};
