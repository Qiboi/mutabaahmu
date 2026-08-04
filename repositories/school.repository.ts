import { connectDB } from "@/lib/db/connect";
import { SchoolModel, type ISchool } from "@/models/School";
import type { CreateSchoolInput, UpdateSchoolInput } from "@/features/schools/schemas/school.schema";

export const schoolRepository = {
  /** Single-school app: there is exactly one School document, created on first setup. */
  async getSingleton(): Promise<ISchool | null> {
    await connectDB();
    return SchoolModel.findOne().exec();
  },

  async create(input: CreateSchoolInput): Promise<ISchool> {
    await connectDB();
    return SchoolModel.create(input);
  },

  async update(id: string, input: UpdateSchoolInput): Promise<ISchool | null> {
    await connectDB();
    return SchoolModel.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
  },

  async updateLogoUrl(id: string, logoUrl: string): Promise<ISchool | null> {
    await connectDB();
    return SchoolModel.findByIdAndUpdate(id, { $set: { logoUrl } }, { new: true }).exec();
  },
};
