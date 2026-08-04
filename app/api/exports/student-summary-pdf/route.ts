import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError } from "@/lib/api/handle-error";
import { assertRateLimit } from "@/lib/rate-limit";
import { exportService, ExportError } from "@/lib/export/export.service";
import { assertCanExportStudent } from "@/lib/export/authorize-export";
import { ROLES } from "@/constants/roles";
import type { ApiResponse } from "@/types";

const querySchema = z.object({
  studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "studentId tidak valid"),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.TEACHER, ROLES.SCHOOL_ADMIN, ROLES.SUPER_ADMIN, ROLES.PARENT]);
    assertRateLimit(`export:${user.id}`, 10, 5 * 60 * 1000);
    const { studentId, from, to } = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    await assertCanExportStudent(user, studentId);

    const { buffer, filename } = await exportService.studentSummaryPdf(studentId, from, to, user.id);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
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
