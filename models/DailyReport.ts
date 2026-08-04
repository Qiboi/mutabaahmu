import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { REPORT_STATUS, type ReportStatus } from "@/constants/report-status";

export interface IPrayerItems {
  subuh: boolean;
  dzuhur: boolean;
  ashar: boolean;
  maghrib: boolean;
  isya: boolean;
}

export interface IDailyReportItems {
  prayers: IPrayerItems;
  sunnahPrayer: boolean;
  tilawahPages: number;
  murajaahMinutes: number;
  infak: boolean;
  helpingParents: boolean;
  readingMinutes: number;
  wakeUpEarly: boolean;
  notes?: string;
}

export interface IDailyReport extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  classId: Types.ObjectId; // denormalized for fast class-level queries
  parentId: Types.ObjectId;
  date: Date; // normalized to 00:00 local, one report per student per date
  items: IDailyReportItems;
  totalPoints: number; // computed server-side from School.settings.scoreWeights
  status: ReportStatus;
  teacherComment?: string;
  teacherId?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const prayerItemsSchema = new Schema<IPrayerItems>(
  {
    subuh: { type: Boolean, default: false },
    dzuhur: { type: Boolean, default: false },
    ashar: { type: Boolean, default: false },
    maghrib: { type: Boolean, default: false },
    isya: { type: Boolean, default: false },
  },
  { _id: false },
);

const dailyReportSchema = new Schema<IDailyReport>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "ClassRoom", required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    items: {
      prayers: { type: prayerItemsSchema, required: true, default: () => ({}) },
      sunnahPrayer: { type: Boolean, default: false },
      tilawahPages: { type: Number, default: 0, min: 0 },
      murajaahMinutes: { type: Number, default: 0, min: 0 },
      infak: { type: Boolean, default: false },
      helpingParents: { type: Boolean, default: false },
      readingMinutes: { type: Number, default: 0, min: 0 },
      wakeUpEarly: { type: Boolean, default: false },
      notes: { type: String, trim: true, maxlength: 500 },
    },
    totalPoints: { type: Number, default: 0, index: true },
    status: { type: String, enum: REPORT_STATUS, default: "submitted", index: true },
    teacherComment: { type: String, trim: true, maxlength: 500 },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One report per student per calendar day.
dailyReportSchema.index({ studentId: 1, date: 1 }, { unique: true });
// Fast class-level "who hasn't submitted today" and weekly/monthly aggregate queries.
dailyReportSchema.index({ classId: 1, date: 1 });

export const DailyReportModel: Model<IDailyReport> =
  models.DailyReport ?? model<IDailyReport>("DailyReport", dailyReportSchema);
