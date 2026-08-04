import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { academicYearService } from "@/features/schools/services/academic-year.service";
import { ROLES } from "@/constants/roles";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const { id } = await params;
    const year = await academicYearService.activate(id, user.id);
    return ok(year, "Tahun ajaran aktif berhasil diperbarui");
  } catch (err) {
    return handleApiError(err);
  }
}
