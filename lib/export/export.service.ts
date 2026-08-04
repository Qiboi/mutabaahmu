import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { studentRepository } from "@/repositories/student.repository";
import { classRepository } from "@/repositories/class.repository";
import { dailyReportRepository } from "@/repositories/daily-report.repository";
import { schoolRepository } from "@/repositories/school.repository";
import { activityLogRepository } from "@/repositories/activity-log.repository";
import { buildMonthlyClassWorkbook, buildStudentSummaryWorkbook } from "./excel";
import { buildStudentSummaryPdf } from "./pdf";

export class ExportError extends Error {}

export const exportService = {
  async monthlyClassExcel(classId: string, year: number, month: number, actorId: string) {
    const classRoom = await classRepository.findById(classId);
    if (!classRoom) throw new ExportError("Kelas tidak ditemukan");

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0); // last day of month
    const monthLabel = format(monthStart, "MMMM yyyy", { locale: idLocale });

    const [students, reports] = await Promise.all([
      studentRepository.findAllActiveByClass(classId),
      dailyReportRepository.findAllForClassAndRange(classId, monthStart, monthEnd),
    ]);

    const buffer = await buildMonthlyClassWorkbook({
      className: classRoom.name,
      monthLabel,
      students,
      reports,
      monthStart,
      monthEnd,
    });

    await activityLogRepository.record({
      actorId,
      action: "export",
      entityType: "ClassRoom",
      entityId: classId,
      description: `Mengekspor laporan bulanan Excel untuk kelas "${classRoom.name}" (${monthLabel})`,
    });

    return { buffer, filename: `Laporan-${classRoom.name}-${format(monthStart, "yyyy-MM")}.xlsx` };
  },

  async studentSummaryExcel(studentId: string, from: Date, to: Date, actorId: string) {
    const { student, reports, fromLabel, toLabel } = await this.getStudentSummaryData(studentId, from, to);

    const buffer = await buildStudentSummaryWorkbook({ student, reports, fromLabel, toLabel });

    await activityLogRepository.record({
      actorId,
      action: "export",
      entityType: "Student",
      entityId: studentId,
      description: `Mengekspor ringkasan Excel untuk siswa "${student.fullName}"`,
    });

    return { buffer, filename: `Ringkasan-${student.fullName.replace(/\s+/g, "-")}.xlsx` };
  },

  async studentSummaryPdf(studentId: string, from: Date, to: Date, actorId: string) {
    const { student, reports, fromLabel, toLabel } = await this.getStudentSummaryData(studentId, from, to);
    const school = await schoolRepository.getSingleton();

    const buffer = await buildStudentSummaryPdf({
      student,
      reports,
      fromLabel,
      toLabel,
      schoolName: school?.name,
    });

    await activityLogRepository.record({
      actorId,
      action: "export",
      entityType: "Student",
      entityId: studentId,
      description: `Mengekspor ringkasan PDF untuk siswa "${student.fullName}"`,
    });

    return { buffer, filename: `Ringkasan-${student.fullName.replace(/\s+/g, "-")}.pdf` };
  },

  async getStudentSummaryData(studentId: string, from: Date, to: Date) {
    const student = await studentRepository.findById(studentId);
    if (!student) throw new ExportError("Siswa tidak ditemukan");

    const reports = await dailyReportRepository.findAllForStudentAndRange(studentId, from, to);

    return {
      student,
      reports,
      fromLabel: format(from, "d MMMM yyyy", { locale: idLocale }),
      toLabel: format(to, "d MMMM yyyy", { locale: idLocale }),
    };
  },
};
