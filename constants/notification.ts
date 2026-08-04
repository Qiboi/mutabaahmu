export const NOTIFICATION_TYPES = [
  "evening_reminder",
  "teacher_comment",
  "achievement",
  "announcement",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
