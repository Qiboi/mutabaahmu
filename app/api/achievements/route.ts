import type { NextRequest } from "next/server";
import { requireUser, ForbiddenError } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { achievementRepository } from "@/repositories/achievement.repository";
import { studentService } from "@/features/students/services/student.service";
import { ROLES } from "@/constants/roles";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const studentId = request.nextUrl.searchParams.get("studentId");
    if (!studentId) {
      return ok([]); // no student specified: nothing to return yet
    }

    if (user.role === ROLES.PARENT) {
      const children = await studentService.getForParent(user.id);
      const owns = children.some((c) => c._id.toString() === studentId);
      if (!owns) throw new ForbiddenError("Anda tidak memiliki akses ke data siswa ini");
    }

    const achievements = await achievementRepository.listForStudent(studentId);
    return ok(achievements);
  } catch (err) {
    return handleApiError(err);
  }
}
