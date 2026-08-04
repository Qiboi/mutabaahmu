import { connectDB } from "@/lib/db/connect";
import { StudentModel, type IStudent } from "@/models/Student";
import { toPaginatedResult } from "./pagination.util";
import type { PaginatedResult } from "@/types";
import type {
  CreateStudentInput,
  ListStudentQuery,
  UpdateStudentInput,
} from "@/features/students/schemas/student.schema";

export const studentRepository = {
  async list(query: ListStudentQuery): Promise<PaginatedResult<IStudent>> {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (query.search) filter.$text = { $search: query.search };
    if (query.classId) filter.classId = query.classId;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      StudentModel.find(filter)
        .populate("classId", "name grade")
        .sort({ fullName: 1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      StudentModel.countDocuments(filter).exec(),
    ]);

    return toPaginatedResult(items, query.page, query.limit, total);
  },

  async findById(id: string): Promise<IStudent | null> {
    await connectDB();
    return StudentModel.findById(id).populate("classId", "name grade").populate("parentIds", "name email phone").exec();
  },

  /** Used by parent dashboard to resolve which children belong to the logged-in parent. */
  async findByParentId(parentId: string): Promise<IStudent[]> {
    await connectDB();
    return StudentModel.find({ parentIds: parentId, isActive: true })
      .populate("classId", "name grade")
      .sort({ fullName: 1 })
      .exec();
  },

  async create(input: CreateStudentInput): Promise<IStudent> {
    await connectDB();
    return StudentModel.create(input);
  },

  async update(id: string, input: UpdateStudentInput): Promise<IStudent | null> {
    await connectDB();
    return StudentModel.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
  },

  async softDelete(id: string): Promise<IStudent | null> {
    await connectDB();
    return StudentModel.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).exec();
  },

  async updateAvatarUrl(id: string, avatarUrl: string): Promise<IStudent | null> {
    await connectDB();
    return StudentModel.findByIdAndUpdate(id, { $set: { avatarUrl } }, { new: true }).exec();
  },

  /** Called by the daily-report service right after a report is submitted. */
  async applyReportStats(
    id: string,
    stats: { currentStreakDays: number; longestStreakDays: number; tilawahPagesDelta: number },
  ): Promise<IStudent | null> {
    await connectDB();
    return StudentModel.findByIdAndUpdate(
      id,
      {
        $set: {
          "stats.currentStreakDays": stats.currentStreakDays,
          "stats.longestStreakDays": stats.longestStreakDays,
        },
        $inc: {
          "stats.totalReportsSubmitted": 1,
          "stats.totalTilawahPages": stats.tilawahPagesDelta,
        },
      },
      { new: true },
    ).exec();
  },

  /** All active student ids currently in a class — used to default "promote entire class". */
  async findAllActiveIdsByClass(classId: string): Promise<string[]> {
    await connectDB();
    const students = await StudentModel.find({ classId, isActive: true })
      .select("_id")
      .lean()
      .exec();
    return students.map((s) => String(s._id));
  },

  /** Full active student docs for a class, sorted by name — used by monthly export generation. */
  async findAllActiveByClass(classId: string): Promise<IStudent[]> {
    await connectDB();
    return StudentModel.find({ classId, isActive: true })
      .select("fullName nisn")
      .sort({ fullName: 1 })
      .lean()
      .exec() as unknown as IStudent[];
  },

  /** Bulk-moves a set of students to a new class in a single write — used by class promotion. */
  async bulkMoveClass(studentIds: string[], toClassId: string): Promise<number> {
    await connectDB();
    const result = await StudentModel.updateMany(
      { _id: { $in: studentIds } },
      { $set: { classId: toClassId } },
    ).exec();
    return result.modifiedCount;
  },
};
