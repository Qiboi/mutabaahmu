import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { ACHIEVEMENT_CODES, type AchievementCode } from "@/constants/achievement-codes";

/**
 * A single earned-badge record. Definitions (title/icon/criteria) are kept in
 * `constants/achievements.ts` since they are static; this collection only stores
 * who earned what and when, so the gamification service just inserts a document
 * whenever a rule's criteria is met (checked after each report submission).
 */
export interface IAchievement extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  code: AchievementCode;
  title: string;
  description: string;
  earnedAt: Date;
  /** Snapshot of the metric value that triggered it, e.g. { streakDays: 7 } */
  meta?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    code: { type: String, enum: ACHIEVEMENT_CODES, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    earnedAt: { type: Date, default: Date.now },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// A student earns each badge type at most once.
achievementSchema.index({ studentId: 1, code: 1 }, { unique: true });

export const AchievementModel: Model<IAchievement> =
  models.Achievement ?? model<IAchievement>("Achievement", achievementSchema);
