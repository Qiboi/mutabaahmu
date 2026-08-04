export const ACHIEVEMENT_CODES = [
  "streak_7_days",
  "prayer_30_days",
  "tilawah_100_pages",
  "wake_up_early_streak",
  "helping_parents_14_days",
] as const;
export type AchievementCode = (typeof ACHIEVEMENT_CODES)[number];
