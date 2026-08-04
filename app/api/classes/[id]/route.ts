import type { NextRequest } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { updateClassSchema } from "@/features/classes/schemas/class.schema";
import { classService } from "@/features/classes/services/class.service";
import { ROLES } from "@/constants/roles";
import { NotFoundError } from "@/features/reports/services/daily-report.service";
import { idOf } from "@/utils/object-id";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const classRoom = await classService.getById(id);
    if (!classRoom) throw new NotFoundError("Kelas tidak ditemukan");

    // Teachers may only view classes they're assigned to.
    if (
      user.role === ROLES.TEACHER &&
      idOf(classRoom.homeroomTeacherId) !== user.id &&
      !classRoom.teacherIds.some((t) => idOf(t) === user.id)
    ) {
      throw new ForbiddenError("Anda tidak memiliki akses ke kelas ini");
    }

    return ok(classRoom);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const { id } = await params;
    const body = await request.json();
    const input = updateClassSchema.parse(body);
    const classRoom = await classService.update(id, input, user.id);
    if (!classRoom) throw new NotFoundError("Kelas tidak ditemukan");
    return ok(classRoom, "Kelas berhasil diperbarui");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const { id } = await params;
    const classRoom = await classService.archive(id, user.id);
    if (!classRoom) throw new NotFoundError("Kelas tidak ditemukan");
    return ok(classRoom, "Kelas berhasil diarsipkan");
  } catch (err) {
    return handleApiError(err);
  }
}
