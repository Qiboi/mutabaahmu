import { schoolRepository } from "@/repositories/school.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import type { CreateSchoolInput, UpdateSchoolInput } from "../schemas/school.schema";

export class SchoolAlreadyExistsError extends Error {}

export const schoolService = {
  async getSchool() {
    return schoolRepository.getSingleton();
  },

  /** This app is single-school: setup can only run once. Re-running should use `update`. */
  async setupSchool(input: CreateSchoolInput, actorId: string) {
    const existing = await schoolRepository.getSingleton();
    if (existing) {
      throw new SchoolAlreadyExistsError("Sekolah sudah pernah dikonfigurasi. Gunakan update.");
    }
    const school = await schoolRepository.create(input);
    await activityLogRepository.record({
      actorId,
      action: "create",
      entityType: "School",
      entityId: school._id.toString(),
      description: `Menyelesaikan setup awal sekolah "${school.name}"`,
    });
    return school;
  },

  async updateSchool(input: UpdateSchoolInput, actorId: string) {
    const existing = await schoolRepository.getSingleton();
    if (!existing) {
      throw new SchoolAlreadyExistsError("Sekolah belum dikonfigurasi. Jalankan setup terlebih dahulu.");
    }
    const school = await schoolRepository.update(existing._id.toString(), input);
    if (school) {
      await activityLogRepository.record({
        actorId,
        action: "update",
        entityType: "School",
        entityId: school._id.toString(),
        description: `Memperbarui pengaturan sekolah "${school.name}"`,
      });
    }
    return school;
  },
};
