import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { createSchoolSchema, updateSchoolSchema } from "@/features/schools/schemas/school.schema";
import { schoolService } from "@/features/schools/services/school.service";
import { ROLES } from "@/constants/roles";

export async function GET() {
  try {
    await requireUser(); // any authenticated role may read school profile/settings
    const school = await schoolService.getSchool();
    return ok(school);
  } catch (err) {
    return handleApiError(err);
  }
}

/** First-time setup. Only Super Admin may create the (single) School document. */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN]);
    const body = await request.json();
    const input = createSchoolSchema.parse(body);
    const school = await schoolService.setupSchool(input, user.id);
    return ok(school, "Sekolah berhasil dikonfigurasi", 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const body = await request.json();
    const input = updateSchoolSchema.parse(body);
    const school = await schoolService.updateSchool(input, user.id);
    return ok(school, "Pengaturan sekolah berhasil diperbarui");
  } catch (err) {
    return handleApiError(err);
  }
}
