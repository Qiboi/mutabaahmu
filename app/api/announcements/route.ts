import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { announcementRepository } from "@/repositories/announcement.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import { createAnnouncementSchema } from "@/features/announcements/schemas/announcement.schema";
import { ROLES } from "@/constants/roles";

const AUDIENCE_FOR_ROLE: Record<string, "teachers" | "parents"> = {
  [ROLES.TEACHER]: "teachers",
  [ROLES.PARENT]: "parents",
};

const listQuerySchema = z.object({
  classId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { classId, page, limit } = listQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const audience =
      user.role === ROLES.SUPER_ADMIN || user.role === ROLES.SCHOOL_ADMIN
        ? "all"
        : AUDIENCE_FOR_ROLE[user.role] ?? "all";

    const result = await announcementRepository.listForAudience(audience, classId, page, limit);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const body = await request.json();
    const input = createAnnouncementSchema.parse(body);
    const announcement = await announcementRepository.create({ ...input, authorId: user.id });
    await activityLogRepository.record({
      actorId: user.id,
      action: "create",
      entityType: "Announcement",
      entityId: announcement._id.toString(),
      description: `Mempublikasikan pengumuman "${announcement.title}"`,
    });
    return ok(announcement, "Pengumuman berhasil dipublikasikan", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
