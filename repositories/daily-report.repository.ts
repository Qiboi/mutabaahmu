import { connectDB } from "@/lib/db/connect";
import { DailyReportModel, type IDailyReport } from "@/models/DailyReport";
import { toPaginatedResult } from "./pagination.util";
import type { PaginatedResult } from "@/types";
import type {
  CreateDailyReportInput,
  ListDailyReportQuery,
} from "@/features/reports/schemas/daily-report.schema";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const dailyReportRepository = {
  async list(query: ListDailyReportQuery): Promise<PaginatedResult<IDailyReport>> {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (query.studentId) filter.studentId = query.studentId;
    if (query.classId) filter.classId = query.classId;
    if (query.from || query.to) {
      filter.date = {
        ...(query.from ? { $gte: startOfDay(query.from) } : {}),
        ...(query.to ? { $lte: startOfDay(query.to) } : {}),
      };
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      DailyReportModel.find(filter)
        .populate("studentId", "fullName avatarUrl")
        .sort({ date: -1 })
        .skip(skip)
        .limit(query.limit)
        .exec(),
      DailyReportModel.countDocuments(filter).exec(),
    ]);

    return toPaginatedResult(items, query.page, query.limit, total);
  },

  async findById(id: string): Promise<IDailyReport | null> {
    await connectDB();
    return DailyReportModel.findById(id)
      .populate("studentId", "fullName avatarUrl classId")
      .populate("parentId", "name")
      .populate("teacherId", "name")
      .exec();
  },

  async findByStudentAndDate(studentId: string, date: Date): Promise<IDailyReport | null> {
    await connectDB();
    return DailyReportModel.findOne({ studentId, date: startOfDay(date) }).exec();
  },

  /** Which students in a class have NOT submitted a report for the given date (teacher dashboard). */
  async submittedStudentIdsForClassDate(classId: string, date: Date): Promise<string[]> {
    await connectDB();
    const reports = await DailyReportModel.find({ classId, date: startOfDay(date) })
      .select("studentId")
      .lean()
      .exec();
    return reports.map((r) => r.studentId.toString());
  },

  async create(
    input: CreateDailyReportInput & { classId: string; parentId: string; totalPoints: number },
  ): Promise<IDailyReport> {
    await connectDB();
    return DailyReportModel.create({ ...input, date: startOfDay(input.date) });
  },

  async addTeacherComment(
    id: string,
    teacherId: string,
    teacherComment: string,
  ): Promise<IDailyReport | null> {
    await connectDB();
    return DailyReportModel.findByIdAndUpdate(
      id,
      {
        $set: { teacherComment, teacherId, status: "reviewed", reviewedAt: new Date() },
      },
      { new: true },
    ).exec();
  },

  /** Last N reports for a student, oldest first — used to compute streaks for achievements. */
  async recentByStudent(studentId: string, limit: number): Promise<IDailyReport[]> {
    await connectDB();
    return DailyReportModel.find({ studentId })
      .sort({ date: -1 })
      .limit(limit)
      .lean()
      .exec() as unknown as IDailyReport[];
  },

  /**
   * Unpaginated fetch for a whole class over a date range — used by export generation, where
   * the normal list() method's 100-row cap would silently truncate a full month/semester of data
   * (a 30-student class over 30 days is already 900 potential reports).
   */
  async findAllForClassAndRange(classId: string, from: Date, to: Date): Promise<IDailyReport[]> {
    await connectDB();
    return DailyReportModel.find({ classId, date: { $gte: startOfDay(from), $lte: startOfDay(to) } })
      .lean()
      .exec() as unknown as IDailyReport[];
  },

  /** Unpaginated fetch for a single student over a date range — used by export generation. */
  async findAllForStudentAndRange(studentId: string, from: Date, to: Date): Promise<IDailyReport[]> {
    await connectDB();
    return DailyReportModel.find({ studentId, date: { $gte: startOfDay(from), $lte: startOfDay(to) } })
      .populate("teacherId", "name")
      .lean()
      .exec() as unknown as IDailyReport[];
  },
};
