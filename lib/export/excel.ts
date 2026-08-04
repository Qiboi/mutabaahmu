import ExcelJS from "exceljs";
import { format, eachDayOfInterval } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { IDailyReport } from "@/models/DailyReport";
import type { IStudent } from "@/models/Student";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF059669" }, // emerald-600
};
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" } };

/**
 * One row per student, one column per calendar day in the month.
 * Cell value = total points that day, blank if the student didn't submit a report.
 * Last column = average points across days that had a submission.
 */
export async function buildMonthlyClassWorkbook(params: {
  className: string;
  monthLabel: string;
  students: Pick<IStudent, "_id" | "fullName">[];
  reports: IDailyReport[];
  monthStart: Date;
  monthEnd: Date;
}): Promise<ExcelJS.Buffer> {
  const { className, monthLabel, students, reports, monthStart, monthEnd } = params;
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const reportsByStudentDay = new Map<string, IDailyReport>();
  reports.forEach((r) => {
    const key = `${r.studentId.toString()}_${format(new Date(r.date), "yyyy-MM-dd")}`;
    reportsByStudentDay.set(key, r);
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mutabaah";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Laporan ${monthLabel}`);

  sheet.mergeCells(1, 1, 1, days.length + 3);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `Laporan Bulanan — Kelas ${className} — ${monthLabel}`;
  titleCell.font = { bold: true, size: 14 };

  const headerRowIndex = 3;
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.getCell(1).value = "Nama Siswa";
  days.forEach((d, i) => {
    headerRow.getCell(2 + i).value = format(d, "d");
  });
  headerRow.getCell(2 + days.length).value = "Rata-rata";
  headerRow.getCell(3 + days.length).value = "Jumlah Lapor";

  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  students.forEach((student, rowOffset) => {
    const row = sheet.getRow(headerRowIndex + 1 + rowOffset);
    row.getCell(1).value = student.fullName;

    let sum = 0;
    let count = 0;
    days.forEach((d, i) => {
      const key = `${student._id.toString()}_${format(d, "yyyy-MM-dd")}`;
      const report = reportsByStudentDay.get(key);
      if (report) {
        row.getCell(2 + i).value = report.totalPoints;
        sum += report.totalPoints;
        count += 1;
      }
    });
    row.getCell(2 + days.length).value = count > 0 ? Math.round(sum / count) : "-";
    row.getCell(3 + days.length).value = count;
  });

  sheet.getColumn(1).width = 28;
  for (let i = 0; i < days.length; i++) {
    sheet.getColumn(2 + i).width = 5;
  }
  sheet.getColumn(2 + days.length).width = 12;
  sheet.getColumn(3 + days.length).width = 12;
  sheet.views = [{ state: "frozen", xSplit: 1, ySplit: headerRowIndex }];

  return workbook.xlsx.writeBuffer();
}

/** One row per daily report within the date range, for a single student. */
export async function buildStudentSummaryWorkbook(params: {
  student: Pick<IStudent, "fullName" | "nisn">;
  reports: IDailyReport[];
  fromLabel: string;
  toLabel: string;
}): Promise<ExcelJS.Buffer> {
  const { student, reports, fromLabel, toLabel } = params;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mutabaah";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Ringkasan Siswa");

  sheet.mergeCells(1, 1, 1, 11);
  sheet.getCell(1, 1).value = `Ringkasan Laporan — ${student.fullName}${student.nisn ? ` (NISN: ${student.nisn})` : ""}`;
  sheet.getCell(1, 1).font = { bold: true, size: 14 };
  sheet.mergeCells(2, 1, 2, 11);
  sheet.getCell(2, 1).value = `Periode: ${fromLabel} — ${toLabel}`;

  const headers = [
    "Tanggal",
    "Subuh",
    "Dzuhur",
    "Ashar",
    "Maghrib",
    "Isya",
    "Tilawah (hal)",
    "Murajaah (mnt)",
    "Membaca (mnt)",
    "Total Poin",
    "Komentar Guru",
  ];
  const headerRow = sheet.getRow(4);
  headers.forEach((h, i) => (headerRow.getCell(1 + i).value = h));
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });

  const YES = "✓";
  const NO = "-";
  reports
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach((r, i) => {
      const row = sheet.getRow(5 + i);
      row.getCell(1).value = format(new Date(r.date), "d MMM yyyy", { locale: idLocale });
      row.getCell(2).value = r.items.prayers.subuh ? YES : NO;
      row.getCell(3).value = r.items.prayers.dzuhur ? YES : NO;
      row.getCell(4).value = r.items.prayers.ashar ? YES : NO;
      row.getCell(5).value = r.items.prayers.maghrib ? YES : NO;
      row.getCell(6).value = r.items.prayers.isya ? YES : NO;
      row.getCell(7).value = r.items.tilawahPages;
      row.getCell(8).value = r.items.murajaahMinutes;
      row.getCell(9).value = r.items.readingMinutes;
      row.getCell(10).value = r.totalPoints;
      row.getCell(11).value = r.teacherComment ?? "";
    });

  sheet.columns.forEach((col, i) => {
    col.width = i === 0 ? 14 : i === 10 ? 30 : 12;
  });
  sheet.views = [{ state: "frozen", ySplit: 4 }];

  return workbook.xlsx.writeBuffer();
}
