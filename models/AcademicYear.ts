import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import { SEMESTERS, type Semester } from "@/constants/semester";

export interface IAcademicYear extends Document {
  _id: Types.ObjectId;
  label: string; // e.g. "2025/2026"
  semester: Semester;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    label: { type: String, required: true, trim: true },
    semester: { type: String, enum: SEMESTERS, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

academicYearSchema.index({ label: 1, semester: 1 }, { unique: true });

export const AcademicYearModel: Model<IAcademicYear> =
  models.AcademicYear ?? model<IAcademicYear>("AcademicYear", academicYearSchema);
