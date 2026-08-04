import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { createAcademicYearSchema } from "@/features/schools/schemas/academic-year.schema";
import { academicYearService } from "@/features/schools/services/academic-year.service";
import { ROLES } from "@/constants/roles";

export async function GET() {
  try {
    await requireUser();
    const years = await academicYearService.list();
    return ok(years);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const body = await request.json();
    const input = createAcademicYearSchema.parse(body);
    const year = await academicYearService.create(input, user.id);
    return ok(year, "Tahun ajaran berhasil dibuat", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
