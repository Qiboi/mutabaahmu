import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser, ForbiddenError } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { classService } from "@/features/classes/services/class.service";
import { ROLES } from "@/constants/roles";
import { idOf } from "@/utils/object-id";

const querySchema = z.object({
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/, "classId tidak valid"),
  date: z.coerce.date().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.SUPER_ADMIN]);
    const { classId, date } = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    // Teachers may only view stats for a class they're actually assigned to.
    if (user.role === ROLES.TEACHER) {
      const classRoom = await classService.getById(classId);
      const ownsClass =
        !!classRoom &&
        (idOf(classRoom.homeroomTeacherId) === user.id ||
          classRoom.teacherIds.some((t) => idOf(t) === user.id));
      if (!ownsClass) throw new ForbiddenError("Anda tidak memiliki akses ke kelas ini");
    }

    const stats = await dashboardService.getTeacherClassStats(classId, date ?? new Date());
    return ok(stats);
  } catch (err) {
    return handleApiError(err);
  }
}
