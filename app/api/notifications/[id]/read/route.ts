import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { notificationRepository } from "@/repositories/notification.repository";
import { NotFoundError } from "@/features/reports/services/daily-report.service";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const notif = await notificationRepository.markRead(id, user.id);
    if (!notif) throw new NotFoundError("Notifikasi tidak ditemukan");
    return ok(notif);
  } catch (err) {
    return handleApiError(err);
  }
}
