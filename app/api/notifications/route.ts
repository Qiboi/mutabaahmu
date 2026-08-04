import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { notificationRepository } from "@/repositories/notification.repository";

export async function GET() {
  try {
    const user = await requireUser();
    const [items, unreadCount] = await Promise.all([
      notificationRepository.listForUser(user.id),
      notificationRepository.unreadCount(user.id),
    ]);
    return ok({ items, unreadCount });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(_request: NextRequest) {
  try {
    const user = await requireUser();
    await notificationRepository.markAllRead(user.id);
    return ok(null, "Semua notifikasi ditandai sudah dibaca");
  } catch (err) {
    return handleApiError(err);
  }
}
