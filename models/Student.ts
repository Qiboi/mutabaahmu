import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { GENDERS, type Gender } from "@/constants/gender";

export interface IStudent extends Document {
  _id: Types.ObjectId;
  fullName: string;
  nisn?: string; // Nomor Induk Siswa Nasional
  gender: Gender;
  dateOfBirth?: Date;
  classId: Types.ObjectId;
  parentIds: Types.ObjectId[]; // one or more parents/guardians linked
  avatarUrl?: string | null;
  isActive: boolean;
  /** Denormalized running totals, refreshed by report-submission service for fast dashboards. */
  stats: {
    currentStreakDays: number;
    longestStreakDays: number;
    totalReportsSubmitted: number;
    totalTilawahPages: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 160 },
    nisn: { type: String, trim: true },
    gender: { type: String, enum: GENDERS, required: true },
    dateOfBirth: { type: Date },
    classId: { type: Schema.Types.ObjectId, ref: "ClassRoom", required: true, index: true },
    parentIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    avatarUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true, index: true },
    stats: {
      currentStreakDays: { type: Number, default: 0 },
      longestStreakDays: { type: Number, default: 0 },
      totalReportsSubmitted: { type: Number, default: 0 },
      totalTilawahPages: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

studentSchema.index({ classId: 1, isActive: 1 });
studentSchema.index({ fullName: "text" });

export const StudentModel: Model<IStudent> =
  models.Student ?? model<IStudent>("Student", studentSchema);
