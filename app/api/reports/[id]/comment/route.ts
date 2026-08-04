import type { NextRequest } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { teacherCommentSchema } from "@/features/reports/schemas/daily-report.schema";
import { dailyReportService, NotFoundError } from "@/features/reports/services/daily-report.service";
import { classService } from "@/features/classes/services/class.service";
import { ROLES } from "@/constants/roles";
import { idOf } from "@/utils/object-id";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser([ROLES.TEACHER, ROLES.SCHOOL_ADMIN]);
    const { id } = await params;
    const body = await request.json();
    const input = teacherCommentSchema.parse(body);

    // Teachers may only comment on reports from a class they're actually assigned to.
    if (user.role === ROLES.TEACHER) {
      const existingReport = await dailyReportService.getById(id);
      if (!existingReport) throw new NotFoundError("Laporan tidak ditemukan");

      const classRoom = await classService.getById(idOf(existingReport.classId) as string);
      const ownsClass =
        !!classRoom &&
        (idOf(classRoom.homeroomTeacherId) === user.id ||
          classRoom.teacherIds.some((t) => idOf(t) === user.id));
      if (!ownsClass) throw new ForbiddenError("Anda tidak memiliki akses ke laporan ini");
    }

    const report = await dailyReportService.addTeacherComment(id, user.id, input);
    return ok(report, "Komentar berhasil ditambahkan");
  } catch (err) {
    return handleApiError(err);
  }
}
