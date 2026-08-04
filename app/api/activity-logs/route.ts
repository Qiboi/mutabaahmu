import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import { ACTIVITY_ACTIONS } from "@/constants/activity-log";
import { ROLES } from "@/constants/roles";

const querySchema = z.object({
  entityType: z.string().optional(),
  action: z.enum(ACTIVITY_ACTIONS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const query = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const logs = await activityLogRepository.listRecent(query);
    return ok(logs);
  } catch (err) {
    return handleApiError(err);
  }
}
