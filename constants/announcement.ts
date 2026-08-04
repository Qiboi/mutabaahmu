export const ANNOUNCEMENT_AUDIENCES = ["all", "teachers", "parents", "class"] as const;
export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];
