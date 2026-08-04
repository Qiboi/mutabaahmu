import { ForbiddenError } from "@/lib/auth/require-user";
import { ExportError } from "./export.service";
import { studentRepository } from "@/repositories/student.repository";
import { classRepository } from "@/repositories/class.repository";
import { ROLES, type Role } from "@/constants/roles";
import { idOf } from "@/utils/object-id";

/** Shared by both the Excel and PDF student-summary export routes. */
export async function assertCanExportStudent(user: { id: string; role: Role }, studentId: string) {
  const student = await studentRepository.findById(studentId);
  if (!student) throw new ExportError("Siswa tidak ditemukan");

  if (user.role === ROLES.PARENT) {
    const owns = student.parentIds.some((p) => idOf(p) === user.id);
    if (!owns) throw new ForbiddenError("Anda tidak memiliki akses ke data siswa ini");
    return;
  }

  if (user.role === ROLES.TEACHER) {
    const classRoom = await classRepository.findById(idOf(student.classId) as string);
    const ownsClass =
      !!classRoom &&
      (idOf(classRoom.homeroomTeacherId) === user.id ||
        classRoom.teacherIds.some((t) => idOf(t) === user.id));
    if (!ownsClass) throw new ForbiddenError("Anda tidak memiliki akses ke data siswa ini");
    return;
  }

  // SUPER_ADMIN / SCHOOL_ADMIN: unrestricted.
}
