import { achievementRepository } from "@/repositories/achievement.repository";
import { notificationRepository } from "@/repositories/notification.repository";
import { ACHIEVEMENT_DEFINITIONS } from "@/constants/achievements";
import { idOf } from "@/utils/object-id";
import type { IStudent } from "@/models/Student";
import type { IDailyReport } from "@/models/DailyReport";
import type { AchievementCode } from "@/constants/achievement-codes";

function countPrayersComplete(report: IDailyReport): boolean {
  const p = report.items.prayers;
  return p.subuh && p.dzuhur && p.ashar && p.maghrib && p.isya;
}

/**
 * Evaluates achievement rules for a student right after a report is saved.
 * `recentReports` must be sorted newest-first and include the just-submitted report.
 * Each award is idempotent (unique index on studentId+code), so re-evaluating past
 * criteria on every submission is safe and requires no separate cron job for now.
 */
export const gamificationService = {
  async evaluateAfterReport(
    student: Pick<IStudent, "_id" | "parentIds">,
    recentReports: IDailyReport[],
    currentStreakDays: number,
    totalTilawahPages: number,
  ): Promise<void> {
    const studentId = student._id.toString();
    const toAward: { code: AchievementCode; meta?: Record<string, number> }[] = [];

    if (currentStreakDays >= 7) {
      toAward.push({ code: "streak_7_days", meta: { streakDays: currentStreakDays } });
    }

    if (totalTilawahPages >= 100) {
      toAward.push({ code: "tilawah_100_pages", meta: { totalPages: totalTilawahPages } });
    }

    const last30 = recentReports.slice(0, 30);
    if (last30.length >= 30 && last30.every(countPrayersComplete)) {
      toAward.push({ code: "prayer_30_days", meta: { days: 30 } });
    }

    const last14 = recentReports.slice(0, 14);
    if (last14.length >= 14 && last14.every((r) => r.items.wakeUpEarly)) {
      toAward.push({ code: "wake_up_early_streak", meta: { days: 14 } });
    }
    if (last14.length >= 14 && last14.every((r) => r.items.helpingParents)) {
      toAward.push({ code: "helping_parents_14_days", meta: { days: 14 } });
    }

    for (const { code, meta } of toAward) {
      const def = ACHIEVEMENT_DEFINITIONS[code];
      const awarded = await achievementRepository.award({
        studentId,
        code,
        title: def.title,
        description: def.description,
        meta,
      });
      if (awarded) {
        // Notify every linked parent — badge earned is celebratory, worth surfacing immediately.
        await Promise.all(
          student.parentIds.map((parentId) =>
            notificationRepository.create({
              userId: idOf(parentId) as string,
              type: "achievement",
              title: `Lencana baru: ${def.title}`,
              body: def.description,
              meta: { achievementId: awarded._id.toString(), studentId },
            }),
          ),
        );
      }
    }
  },
};
