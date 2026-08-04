import { dailyReportRepository } from "@/repositories/daily-report.repository";
import { studentRepository } from "@/repositories/student.repository";
import { schoolRepository } from "@/repositories/school.repository";
import { notificationRepository } from "@/repositories/notification.repository";
import { gamificationService } from "@/features/achievements/services/gamification.service";
import { idOf } from "@/utils/object-id";
import type { ISchool } from "@/models/School";
import type { IDailyReport, IDailyReportItems } from "@/models/DailyReport";
import type {
  CreateDailyReportInput,
  ListDailyReportQuery,
  TeacherCommentInput,
} from "../schemas/daily-report.schema";

export class ReportAlreadyExistsError extends Error {}
export class NotFoundError extends Error {}

const DEFAULT_WEIGHTS: ISchool["settings"]["scoreWeights"] = {
  prayer: 10,
  sunnahPrayer: 5,
  tilawah: 10,
  murajaah: 5,
  infak: 5,
  helpingParents: 5,
  reading: 5,
  wakeUpEarly: 5,
};

/** Computes total daily points from School.settings.scoreWeights (falls back to sane defaults). */
function computeTotalPoints(items: IDailyReportItems, weights: ISchool["settings"]["scoreWeights"]): number {
  const prayerCount = Object.values(items.prayers).filter(Boolean).length; // 0-5
  const prayerScore = (prayerCount / 5) * weights.prayer;
  const tilawahScore = Math.min(items.tilawahPages / 5, 1) * weights.tilawah; // 5 pages = full score
  const murajaahScore = Math.min(items.murajaahMinutes / 30, 1) * weights.murajaah;
  const readingScore = Math.min(items.readingMinutes / 30, 1) * weights.reading;

  return Math.round(
    prayerScore +
      tilawahScore +
      murajaahScore +
      readingScore +
      (items.sunnahPrayer ? weights.sunnahPrayer : 0) +
      (items.infak ? weights.infak : 0) +
      (items.helpingParents ? weights.helpingParents : 0) +
      (items.wakeUpEarly ? weights.wakeUpEarly : 0),
  );
}

/** Computes current/longest streak from reports sorted newest-first, given the just-submitted report is included. */
function computeStreaks(reportsNewestFirst: IDailyReport[]): {
  currentStreakDays: number;
  longestStreakDays: number;
} {
  let current = 0;
  let expected: number | null = null;

  for (const report of reportsNewestFirst) {
    const day = new Date(report.date).setHours(0, 0, 0, 0);
    if (expected === null || day === expected) {
      current += 1;
      expected = day - 24 * 60 * 60 * 1000;
    } else {
      break; // streak broken
    }
  }
  // longestStreakDays is only ever raised, never lowered, by the caller (see submit()).
  return { currentStreakDays: current, longestStreakDays: current };
}

export const dailyReportService = {
  list: (query: ListDailyReportQuery) => dailyReportRepository.list(query),

  getById: (id: string) => dailyReportRepository.findById(id),

  submittedStudentIdsForClassDate: (classId: string, date: Date) =>
    dailyReportRepository.submittedStudentIdsForClassDate(classId, date),

  /** Parent submits today's (or a backdated) report for their child. */
  async submit(parentId: string, input: CreateDailyReportInput): Promise<IDailyReport> {
    const student = await studentRepository.findById(input.studentId);
    if (!student) throw new NotFoundError("Siswa tidak ditemukan");

    const existing = await dailyReportRepository.findByStudentAndDate(input.studentId, input.date);
    if (existing) {
      throw new ReportAlreadyExistsError("Laporan untuk tanggal ini sudah pernah diisi");
    }

    const school = await schoolRepository.getSingleton();
    const weights = school?.settings?.scoreWeights ?? DEFAULT_WEIGHTS;
    const totalPoints = computeTotalPoints(input.items, weights);

    const report = await dailyReportRepository.create({
      ...input,
      classId: idOf(student.classId) as string,
      parentId,
      totalPoints,
    });

    // Recompute streaks from the last 30 reports (includes the one just created).
    const recent = await dailyReportRepository.recentByStudent(input.studentId, 30);
    const { currentStreakDays } = computeStreaks(recent);
    const longestStreakDays = Math.max(currentStreakDays, student.stats.longestStreakDays);
    await studentRepository.applyReportStats(input.studentId, {
      currentStreakDays,
      longestStreakDays,
      tilawahPagesDelta: input.items.tilawahPages,
    });

    const updatedStudent = await studentRepository.findById(input.studentId);
    if (updatedStudent) {
      await gamificationService.evaluateAfterReport(
        updatedStudent,
        recent,
        currentStreakDays,
        updatedStudent.stats.totalTilawahPages,
      );
    }

    return report;
  },

  /** Teacher leaves a comment on a submitted report; notifies the parent. */
  async addTeacherComment(
    reportId: string,
    teacherId: string,
    input: TeacherCommentInput,
  ): Promise<IDailyReport> {
    const report = await dailyReportRepository.addTeacherComment(
      reportId,
      teacherId,
      input.teacherComment,
    );
    if (!report) throw new NotFoundError("Laporan tidak ditemukan");

    await notificationRepository.create({
      userId: report.parentId.toString(),
      type: "teacher_comment",
      title: "Komentar guru baru",
      body: input.teacherComment,
      meta: { reportId: report._id.toString() },
    });

    return report;
  },
};
