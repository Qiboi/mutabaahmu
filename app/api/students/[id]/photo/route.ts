import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { assertRateLimit } from "@/lib/rate-limit";
import { uploadImage, UploadValidationError } from "@/lib/blob/upload";
import { studentRepository } from "@/repositories/student.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import { NotFoundError } from "@/features/reports/services/daily-report.service";
import { ROLES } from "@/constants/roles";
import type { ApiResponse } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    assertRateLimit(`upload:${user.id}`, 20, 5 * 60 * 1000);

    const { id } = await params;
    const student = await studentRepository.findById(id);
    if (!student) throw new NotFoundError("Siswa tidak ditemukan");

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: "File tidak ditemukan pada request" },
        { status: 422 },
      );
    }

    const avatarUrl = await uploadImage("students", file, student.avatarUrl);
    const updated = await studentRepository.updateAvatarUrl(id, avatarUrl);

    await activityLogRepository.record({
      actorId: user.id,
      action: "update",
      entityType: "Student",
      entityId: id,
      description: `Memperbarui foto profil siswa "${student.fullName}"`,
    });

    return ok(updated, "Foto profil berhasil diperbarui");
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
