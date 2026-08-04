"use client";

import { useState } from "react";
import { Bell, Trophy, MessageSquare, Megaphone, AlarmClock, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/use-notifications";
import type { INotification } from "@/models/Notification";
import type { NotificationType } from "@/constants/notification";

const ICONS: Record<NotificationType, typeof Bell> = {
  evening_reminder: AlarmClock,
  teacher_comment: MessageSquare,
  achievement: Trophy,
  announcement: Megaphone,
};

function NotificationItem({ notification }: { notification: INotification }) {
  const markRead = useMarkNotificationRead();
  const Icon = ICONS[notification.type];

  return (
    <button
      onClick={() => !notification.isRead && markRead.mutate(notification._id.toString())}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50",
        !notification.isRead && "bg-emerald-50/50",
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium text-slate-900", !notification.isRead && "font-semibold")}>
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{notification.body}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: idLocale })}
        </p>
      </div>
      {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
    </button>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notifikasi</p>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800"
                >
                  <Check className="h-3.5 w-3.5" />
                  Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {!data || data.items.length === 0 ? (
                <EmptyState icon={Bell} title="Belum ada notifikasi" className="py-10" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.items.map((n) => (
                    <NotificationItem key={n._id.toString()} notification={n} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
