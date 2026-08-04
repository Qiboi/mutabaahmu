import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

export interface ISchool extends Document {
  _id: Types.ObjectId;
  name: string;
  npsn?: string; // Nomor Pokok Sekolah Nasional
  address?: string;
  phone?: string;
  logoUrl?: string | null;
  principalName?: string;
  activeAcademicYearId?: Types.ObjectId | null;
  settings: {
    reportDeadlineHour: number; // e.g. 20 => reminder at 20:00 if not submitted
    scoreWeights: {
      prayer: number;
      sunnahPrayer: number;
      tilawah: number;
      murajaah: number;
      infak: number;
      helpingParents: number;
      reading: number;
      wakeUpEarly: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    npsn: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    logoUrl: { type: String, default: null },
    principalName: { type: String, trim: true },
    activeAcademicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", default: null },
    settings: {
      reportDeadlineHour: { type: Number, default: 20, min: 0, max: 23 },
      scoreWeights: {
        prayer: { type: Number, default: 10 },
        sunnahPrayer: { type: Number, default: 5 },
        tilawah: { type: Number, default: 10 },
        murajaah: { type: Number, default: 5 },
        infak: { type: Number, default: 5 },
        helpingParents: { type: Number, default: 5 },
        reading: { type: Number, default: 5 },
        wakeUpEarly: { type: Number, default: 5 },
      },
    },
  },
  { timestamps: true },
);

export const SchoolModel: Model<ISchool> = models.School ?? model<ISchool>("School", schoolSchema);
