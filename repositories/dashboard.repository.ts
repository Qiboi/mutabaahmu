import { connectDB } from "@/lib/db/connect";
import { ClassRoomModel } from "@/models/ClassRoom";
import { StudentModel } from "@/models/Student";
import { DailyReportModel } from "@/models/DailyReport";
import { UserModel } from "@/models/User";
import { ROLES } from "@/constants/roles";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export const dashboardRepository = {
  /** School-wide stats for the admin dashboard. */
  async getAdminStats() {
    await connectDB();
    const today = startOfDay(new Date());

    const [totalStudents, totalClasses, totalParents, todaySubmittedStudentIds, classes] =
      await Promise.all([
        StudentModel.countDocuments({ isActive: true }).exec(),
        ClassRoomModel.countDocuments({ isActive: true }).exec(),
        UserModel.countDocuments({ role: ROLES.PARENT }).exec(),
        DailyReportModel.distinct("studentId", { date: today }).exec(),
        ClassRoomModel.find({ isActive: true }).select("name studentCount").lean().exec(),
      ]);

    const completionRateToday =
      totalStudents === 0 ? 0 : Math.round((todaySubmittedStudentIds.length / totalStudents) * 100);

    // Per-class completion rate today, to find most/least active classes.
    const perClassSubmitted = await DailyReportModel.aggregate<{ _id: string; count: number }>([
      { $match: { date: today } },
      { $group: { _id: "$classId", count: { $sum: 1 } } },
    ]).exec();
    const submittedByClass = new Map(perClassSubmitted.map((c) => [c._id.toString(), c.count]));

    const classRates = classes
      .filter((c) => c.studentCount > 0)
      .map((c) => ({
        classId: c._id.toString(),
        name: c.name,
        rate: Math.round(((submittedByClass.get(c._id.toString()) ?? 0) / c.studentCount) * 100),
      }));

    const mostActiveClass = classRates.length
      ? classRates.reduce((a, b) => (b.rate > a.rate ? b : a))
      : null;
    const leastActiveClass = classRates.length
      ? classRates.reduce((a, b) => (b.rate < a.rate ? b : a))
      : null;

    // Parent participation: parents who have submitted at least one report in the last 7 days.
    const activeParentIds = await DailyReportModel.distinct("parentId", {
      date: { $gte: daysAgo(7) },
    }).exec();
    const parentParticipationRate =
      totalParents === 0 ? 0 : Math.round((activeParentIds.length / totalParents) * 100);

    // Last 7 days completion trend, for the line/bar chart.
    const trendRaw = await DailyReportModel.aggregate<{ _id: string; count: number }>([
      { $match: { date: { $gte: daysAgo(6) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
        },
      },
    ]).exec();
    const trendMap = new Map(trendRaw.map((t) => [t._id, t.count]));
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = daysAgo(6 - i);
      const key = d.toISOString().slice(0, 10);
      const submitted = trendMap.get(key) ?? 0;
      return {
        date: key,
        completionRate: totalStudents === 0 ? 0 : Math.round((submitted / totalStudents) * 100),
      };
    });

    return {
      totalStudents,
      totalClasses,
      totalParents,
      completionRateToday,
      mostActiveClass,
      leastActiveClass,
      parentParticipationRate,
      last7Days,
      classRates: classRates.sort((a, b) => b.rate - a.rate),
    };
  },

  /** Per-class stats for the teacher dashboard: who has/hasn't submitted today, weekly/monthly counts. */
  async getTeacherClassStats(classId: string, date: Date) {
    await connectDB();
    const day = startOfDay(date);

    const [students, submittedToday] = await Promise.all([
      StudentModel.find({ classId, isActive: true })
        .select("fullName stats.currentStreakDays stats.longestStreakDays")
        .sort({ fullName: 1 })
        .lean()
        .exec(),
      DailyReportModel.find({ classId, date: day }).select("studentId totalPoints").lean().exec(),
    ]);

    const submittedIds = new Set(submittedToday.map((r) => r.studentId.toString()));
    const notSubmitted = students.filter((s) => !submittedIds.has(String(s._id)));
    const submitted = students.filter((s) => submittedIds.has(String(s._id)));

    const weeklyCount = await DailyReportModel.countDocuments({
      classId,
      date: { $gte: daysAgo(6) },
    }).exec();
    const monthlyCount = await DailyReportModel.countDocuments({
      classId,
      date: { $gte: daysAgo(29) },
    }).exec();

    const bestConsistency = [...students]
      .sort((a, b) => (b.stats?.currentStreakDays ?? 0) - (a.stats?.currentStreakDays ?? 0))
      .slice(0, 5)
      .map((s) => ({
        studentId: String(s._id),
        fullName: s.fullName,
        currentStreakDays: s.stats?.currentStreakDays ?? 0,
      }));

    return {
      totalStudents: students.length,
      submittedCount: submitted.length,
      notSubmittedStudents: notSubmitted.map((s) => ({ studentId: String(s._id), fullName: s.fullName })),
      weeklyCount,
      monthlyCount,
      bestConsistency,
    };
  },

  /** Per-class trend (completion rate + average points) over the last N days, for the admin's class detail chart. */
  async getClassTrend(classId: string, days = 14) {
    await connectDB();
    const totalStudents = await StudentModel.countDocuments({ classId, isActive: true }).exec();

    const raw = await DailyReportModel.aggregate<{ _id: string; count: number; avgPoints: number }>([
      { $match: { classId, date: { $gte: daysAgo(days - 1) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
          avgPoints: { $avg: "$totalPoints" },
        },
      },
    ]).exec();
    const map = new Map(raw.map((r) => [r._id, r]));

    const trend = Array.from({ length: days }).map((_, i) => {
      const d = daysAgo(days - 1 - i);
      const key = d.toISOString().slice(0, 10);
      const entry = map.get(key);
      return {
        date: key,
        completionRate:
          totalStudents === 0 || !entry ? 0 : Math.round((entry.count / totalStudents) * 100),
        avgPoints: entry ? Math.round(entry.avgPoints) : 0,
      };
    });

    return { totalStudents, trend };
  },
};
