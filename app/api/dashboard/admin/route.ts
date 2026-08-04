import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { ROLES } from "@/constants/roles";

export async function GET() {
  try {
    await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const stats = await dashboardService.getAdminStats();
    return ok(stats);
  } catch (err) {
    return handleApiError(err);
  }
}
