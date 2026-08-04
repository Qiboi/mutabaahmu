import { studentRepository } from "@/repositories/student.repository";
import { classRepository } from "@/repositories/class.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import { idOf } from "@/utils/object-id";
import type {
  CreateStudentInput,
  ListStudentQuery,
  UpdateStudentInput,
} from "../schemas/student.schema";

export const studentService = {
  list: (query: ListStudentQuery) => studentRepository.list(query),

  getById: (id: string) => studentRepository.findById(id),

  getForParent: (parentId: string) => studentRepository.findByParentId(parentId),

  async create(input: CreateStudentInput, actorId: string) {
    const student = await studentRepository.create(input);
    await classRepository.recomputeStudentCount(input.classId);
    await activityLogRepository.record({
      actorId,
      action: "create",
      entityType: "Student",
      entityId: student._id.toString(),
      description: `Menambahkan siswa baru "${student.fullName}"`,
    });
    return student;
  },

  async update(id: string, input: UpdateStudentInput, actorId: string) {
    const before = await studentRepository.findById(id);
    const beforeClassId = idOf(before?.classId);
    const student = await studentRepository.update(id, input);

    // Recompute studentCount whenever it could have changed: the student moved classes,
    // or their isActive status flipped (studentCount only counts isActive:true students).
    if (before) {
      const classChanged = !!input.classId && input.classId !== beforeClassId;
      const statusChanged = input.isActive !== undefined && input.isActive !== before.isActive;
      if (classChanged) {
        await classRepository.recomputeStudentCount(beforeClassId as string);
        await classRepository.recomputeStudentCount(input.classId as string);
      } else if (statusChanged) {
        await classRepository.recomputeStudentCount(beforeClassId as string);
      }
    }

    if (student) {
      await activityLogRepository.record({
        actorId,
        action: "update",
        entityType: "Student",
        entityId: student._id.toString(),
        description: `Memperbarui data siswa "${student.fullName}"`,
      });
    }
    return student;
  },

  async archive(id: string, actorId: string) {
    const student = await studentRepository.softDelete(id);
    if (student) {
      await classRepository.recomputeStudentCount(idOf(student.classId) as string);
      await activityLogRepository.record({
        actorId,
        action: "delete",
        entityType: "Student",
        entityId: student._id.toString(),
        description: `Mengarsipkan siswa "${student.fullName}"`,
      });
    }
    return student;
  },
};
