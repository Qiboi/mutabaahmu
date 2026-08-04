import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, ForbiddenError } from "@/lib/auth/require-user";
import { handleApiError } from "@/lib/api/handle-error";
import { assertRateLimit } from "@/lib/rate-limit";
import { exportService, ExportError } from "@/lib/export/export.service";
import { classService } from "@/features/classes/services/class.service";
import { ROLES } from "@/constants/roles";
import { idOf } from "@/utils/object-id";
import type { ApiResponse } from "@/types";

const querySchema = z.object({
  classId: z.string().regex(/^[0-9a-fA-F]{24}$/, "classId tidak valid"),
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.SUPER_ADMIN]);
    assertRateLimit(`export:${user.id}`, 10, 5 * 60 * 1000);
    const { classId, year, month } = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    if (user.role === ROLES.TEACHER) {
      const classRoom = await classService.getById(classId);
      const ownsClass =
        !!classRoom &&
        (idOf(classRoom.homeroomTeacherId) === user.id ||
          classRoom.teacherIds.some((t) => idOf(t) === user.id));
      if (!ownsClass) throw new ForbiddenError("Anda tidak memiliki akses ke kelas ini");
    }

    const { buffer, filename } = await exportService.monthlyClassExcel(classId, year, month, user.id);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof ExportError) {
      return NextResponse.json<ApiResponse<never>>({ success: false, message: err.message }, { status: 404 });
    }
    return handleApiError(err);
  }
}
