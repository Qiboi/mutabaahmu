import { connectDB } from "@/lib/db/connect";
import { AchievementModel, type IAchievement } from "@/models/Achievement";
import type { AchievementCode } from "@/constants/achievement-codes";

export const achievementRepository = {
  async listForStudent(studentId: string): Promise<IAchievement[]> {
    await connectDB();
    return AchievementModel.find({ studentId }).sort({ earnedAt: -1 }).exec();
  },

  async hasEarned(studentId: string, code: AchievementCode): Promise<boolean> {
    await connectDB();
    const count = await AchievementModel.countDocuments({ studentId, code }).exec();
    return count > 0;
  },

  /** Idempotent: relies on the unique (studentId, code) index, safely ignores duplicate-award races. */
  async award(input: {
    studentId: string;
    code: AchievementCode;
    title: string;
    description: string;
    meta?: Record<string, number>;
  }): Promise<IAchievement | null> {
    await connectDB();
    try {
      return await AchievementModel.create(input);
    } catch (err) {
      if ((err as { code?: number }).code === 11000) return null; // already earned
      throw err;
    }
  },
};
