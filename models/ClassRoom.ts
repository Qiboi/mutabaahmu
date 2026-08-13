import { Schema, model, models, type Document, type Model, type Types } from "mongoose";
import "@/models/AcademicYear";

export interface IClassRoom extends Document {
  _id: Types.ObjectId;
  name: string; // e.g. "3A - Al Fatih"
  grade: number; // 1-6 for SD
  academicYearId: Types.ObjectId;
  homeroomTeacherId?: Types.ObjectId | null;
  teacherIds: Types.ObjectId[]; // additional teachers with access
  studentCount: number; // denormalized for fast dashboard reads
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classRoomSchema = new Schema<IClassRoom>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    grade: { type: Number, required: true, min: 1, max: 6 },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true, index: true },
    homeroomTeacherId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    teacherIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    studentCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

classRoomSchema.index({ academicYearId: 1, grade: 1 });

export const ClassRoomModel: Model<IClassRoom> =
  models.ClassRoom ?? model<IClassRoom>("ClassRoom", classRoomSchema);
