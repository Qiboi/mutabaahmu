import { academicYearRepository } from "@/repositories/academic-year.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import type { CreateAcademicYearInput } from "../schemas/academic-year.schema";

export const academicYearService = {
  list: () => academicYearRepository.list(),

  async create(input: CreateAcademicYearInput, actorId: string) {
    const year = await academicYearRepository.create(input);
    await activityLogRepository.record({
      actorId,
      action: "create",
      entityType: "AcademicYear",
      entityId: year._id.toString(),
      description: `Membuat tahun ajaran baru "${year.label}" (${year.semester})`,
    });
    return year;
  },

  async activate(id: string, actorId: string) {
    const year = await academicYearRepository.setActive(id);
    if (year) {
      await activityLogRepository.record({
        actorId,
        action: "update",
        entityType: "AcademicYear",
        entityId: year._id.toString(),
        description: `Mengaktifkan tahun ajaran "${year.label}" (${year.semester})`,
      });
    }
    return year;
  },
};
