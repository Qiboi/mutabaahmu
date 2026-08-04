import type { NextRequest } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { updateStudentSchema } from "@/features/students/schemas/student.schema";
import { studentService } from "@/features/students/services/student.service";
import { ROLES } from "@/constants/roles";
import { NotFoundError } from "@/features/reports/services/daily-report.service";
import { idOf } from "@/utils/object-id";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const student = await studentService.getById(id);
    if (!student) throw new NotFoundError("Siswa tidak ditemukan");

    if (
      user.role === ROLES.PARENT &&
      !student.parentIds.some((p) => idOf(p) === user.id)
    ) {
      throw new ForbiddenError("Anda tidak memiliki akses ke data siswa ini");
    }

    return ok(student);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const { id } = await params;
    const body = await request.json();
    const input = updateStudentSchema.parse(body);
    const student = await studentService.update(id, input, user.id);
    if (!student) throw new NotFoundError("Siswa tidak ditemukan");
    return ok(student, "Data siswa berhasil diperbarui");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const { id } = await params;
    const student = await studentService.archive(id, user.id);
    if (!student) throw new NotFoundError("Siswa tidak ditemukan");
    return ok(student, "Siswa berhasil diarsipkan");
  } catch (err) {
    return handleApiError(err);
  }
}
