import type { NextRequest } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { dailyReportService, NotFoundError } from "@/features/reports/services/daily-report.service";
import { ROLES } from "@/constants/roles";
import { idOf } from "@/utils/object-id";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const report = await dailyReportService.getById(id);
    if (!report) throw new NotFoundError("Laporan tidak ditemukan");

    if (user.role === ROLES.PARENT && idOf(report.parentId) !== user.id) {
      throw new ForbiddenError("Anda tidak memiliki akses ke laporan ini");
    }

    return ok(report);
  } catch (err) {
    return handleApiError(err);
  }
}
