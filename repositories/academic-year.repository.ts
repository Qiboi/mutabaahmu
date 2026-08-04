import { connectDB } from "@/lib/db/connect";
import { AcademicYearModel, type IAcademicYear } from "@/models/AcademicYear";
import { SchoolModel } from "@/models/School";
import type { CreateAcademicYearInput } from "@/features/schools/schemas/academic-year.schema";

export const academicYearRepository = {
  async list(): Promise<IAcademicYear[]> {
    await connectDB();
    return AcademicYearModel.find().sort({ startDate: -1 }).exec();
  },

  async findById(id: string): Promise<IAcademicYear | null> {
    await connectDB();
    return AcademicYearModel.findById(id).exec();
  },

  async create(input: CreateAcademicYearInput): Promise<IAcademicYear> {
    await connectDB();
    return AcademicYearModel.create(input);
  },

  /** Marks one academic year active and updates School.activeAcademicYearId; all others become inactive. */
  async setActive(id: string): Promise<IAcademicYear | null> {
    await connectDB();
    await AcademicYearModel.updateMany({}, { $set: { isActive: false } }).exec();
    const year = await AcademicYearModel.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true },
    ).exec();
    if (year) {
      await SchoolModel.updateMany({}, { $set: { activeAcademicYearId: year._id } }).exec();
    }
    return year;
  },
};
