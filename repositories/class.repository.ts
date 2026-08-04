import { connectDB } from "@/lib/db/connect";
import { ClassRoomModel, type IClassRoom } from "@/models/ClassRoom";
import { StudentModel } from "@/models/Student";
import { toPaginatedResult } from "./pagination.util";
import type { PaginatedResult } from "@/types";
import type { CreateClassInput, ListClassQuery, UpdateClassInput } from "@/features/classes/schemas/class.schema";

export const classRepository = {
  async list(query: ListClassQuery): Promise<PaginatedResult<IClassRoom>> {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (query.search) filter.name = { $regex: query.search, $options: "i" };
    if (query.academicYearId) filter.academicYearId = query.academicYearId;
    if (query.grade) filter.grade = query.grade;

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      ClassRoomModel.find(filter)
        .populate("homeroomTeacherId", "name email")
        .sort({ grade: 1, name: 1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      ClassRoomModel.countDocuments(filter).exec(),
    ]);

    return toPaginatedResult(items, query.page, query.limit, total);
  },

  async findById(id: string): Promise<IClassRoom | null> {
    await connectDB();
    return ClassRoomModel.findById(id)
      .populate("homeroomTeacherId", "name email")
      .populate("teacherIds", "name email")
      .populate("academicYearId", "label semester")
      .exec();
  },

  async create(input: CreateClassInput): Promise<IClassRoom> {
    await connectDB();
    return ClassRoomModel.create(input);
  },

  async update(id: string, input: UpdateClassInput): Promise<IClassRoom | null> {
    await connectDB();
    return ClassRoomModel.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
  },

  async softDelete(id: string): Promise<IClassRoom | null> {
    await connectDB();
    return ClassRoomModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).exec();
  },

  /** Keeps ClassRoom.studentCount denormalized field accurate. */
  async recomputeStudentCount(classId: string): Promise<void> {
    await connectDB();
    const count = await StudentModel.countDocuments({ classId, isActive: true }).exec();
    await ClassRoomModel.updateOne({ _id: classId }, { $set: { studentCount: count } }).exec();
  },
};
