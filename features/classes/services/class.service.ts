import { classRepository } from "@/repositories/class.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import type { CreateClassInput, ListClassQuery, UpdateClassInput } from "../schemas/class.schema";

export const classService = {
  list: (query: ListClassQuery) => classRepository.list(query),

  getById: (id: string) => classRepository.findById(id),

  async create(input: CreateClassInput, actorId: string) {
    const classRoom = await classRepository.create(input);
    await activityLogRepository.record({
      actorId,
      action: "create",
      entityType: "ClassRoom",
      entityId: classRoom._id.toString(),
      description: `Membuat kelas baru "${classRoom.name}"`,
    });
    return classRoom;
  },

  async update(id: string, input: UpdateClassInput, actorId: string) {
    const classRoom = await classRepository.update(id, input);
    if (classRoom) {
      await activityLogRepository.record({
        actorId,
        action: "update",
        entityType: "ClassRoom",
        entityId: classRoom._id.toString(),
        description: `Memperbarui kelas "${classRoom.name}"`,
      });
    }
    return classRoom;
  },

  async archive(id: string, actorId: string) {
    const classRoom = await classRepository.softDelete(id);
    if (classRoom) {
      await activityLogRepository.record({
        actorId,
        action: "delete",
        entityType: "ClassRoom",
        entityId: classRoom._id.toString(),
        description: `Mengarsipkan kelas "${classRoom.name}"`,
      });
    }
    return classRoom;
  },
};
