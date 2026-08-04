import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { assertRateLimit } from "@/lib/rate-limit";
import { uploadImage, UploadValidationError } from "@/lib/blob/upload";
import { schoolRepository } from "@/repositories/school.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import { ROLES } from "@/constants/roles";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    assertRateLimit(`upload:${user.id}`, 20, 5 * 60 * 1000);

    const school = await schoolRepository.getSingleton();
    if (!school) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: "Sekolah belum dikonfigurasi. Jalankan setup terlebih dahulu." },
        { status: 404 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: "File tidak ditemukan pada request" },
        { status: 422 },
      );
    }

    const logoUrl = await uploadImage("school", file, school.logoUrl);
    const updated = await schoolRepository.updateLogoUrl(school._id.toString(), logoUrl);

    await activityLogRepository.record({
      actorId: user.id,
      action: "update",
      entityType: "School",
      entityId: school._id.toString(),
      description: `Memperbarui logo sekolah`,
    });

    return ok(updated, "Logo sekolah berhasil diperbarui");
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: err.message },
        { status: 422 },
      );
    }
    return handleApiError(err);
  }
}
