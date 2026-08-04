import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import {
  createDailyReportSchema,
  listDailyReportQuerySchema,
} from "@/features/reports/schemas/daily-report.schema";
import { dailyReportService, ReportAlreadyExistsError } from "@/features/reports/services/daily-report.service";
import type { ApiResponse } from "@/types";
import { studentService } from "@/features/students/services/student.service";
import { classService } from "@/features/classes/services/class.service";
import { ROLES } from "@/constants/roles";
import { idOf } from "@/utils/object-id";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const query = listDailyReportQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    // Parents must always scope by their own child — omitting studentId must NOT fall through
    // to an unrestricted, school-wide report list.
    if (user.role === ROLES.PARENT) {
      if (!query.studentId) {
        throw new ForbiddenError("Parameter studentId wajib diisi untuk melihat laporan");
      }
      const children = await studentService.getForParent(user.id);
      const owns = children.some((c) => c._id.toString() === query.studentId);
      if (!owns) throw new ForbiddenError("Anda tidak memiliki akses ke laporan siswa ini");
    }

    // Teachers must always scope by a class they're actually assigned to — omitting classId,
    // or passing an arbitrary one, must NOT expose other classes' reports.
    if (user.role === ROLES.TEACHER) {
      if (!query.classId) {
        throw new ForbiddenError("Parameter classId wajib diisi untuk melihat laporan");
      }
      const classRoom = await classService.getById(query.classId);
      const ownsClass =
        !!classRoom &&
        (idOf(classRoom.homeroomTeacherId) === user.id ||
          classRoom.teacherIds.some((t) => idOf(t) === user.id));
      if (!ownsClass) throw new ForbiddenError("Anda tidak memiliki akses ke laporan kelas ini");
    }

    const result = await dailyReportService.list(query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.PARENT]);
    const body = await request.json();
    const input = createDailyReportSchema.parse(body);

    const children = await studentService.getForParent(user.id);
    const owns = children.some((c) => c._id.toString() === input.studentId);
    if (!owns) throw new ForbiddenError("Siswa ini bukan anak Anda");

    const report = await dailyReportService.submit(user.id, input);
    return ok(report, "Laporan harian berhasil disimpan", 201);
  } catch (err) {
    if (err instanceof ReportAlreadyExistsError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: err.message },
        { status: 409 },
      );
    }
    return handleApiError(err);
  }
}
