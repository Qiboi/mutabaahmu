import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { IDailyReport } from "@/models/DailyReport";
import type { IStudent } from "@/models/Student";

const EMERALD = "#059669";
const SLATE = "#334155";
const SLATE_LIGHT = "#94a3b8";

/** Formats surah sessions as "Al-Baqarah (1-20), Ali 'Imran (1-5)" for the detail appendix. */
function formatQuranDetails(entries: IDailyReport["items"]["tilawahDetails"]): string {
  if (!entries || entries.length === 0) return "";
  return entries.map((e) => `${e.surahName} (${e.ayatFrom}-${e.ayatTo})`).join(", ");
}

export function buildStudentSummaryPdf(params: {
  student: Pick<IStudent, "fullName" | "nisn">;
  reports: IDailyReport[];
  fromLabel: string;
  toLabel: string;
  schoolName?: string;
}): Promise<Buffer> {
  const { student, reports, fromLabel, toLabel, schoolName } = params;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(18).fillColor(EMERALD).text(schoolName ?? "Mutabaah", { align: "left" });
    doc.fontSize(14).fillColor(SLATE).text(`Ringkasan Laporan Harian — ${student.fullName}`);
    if (student.nisn) {
      doc.fontSize(10).fillColor(SLATE_LIGHT).text(`NISN: ${student.nisn}`);
    }
    doc.fontSize(10).fillColor(SLATE_LIGHT).text(`Periode: ${fromLabel} — ${toLabel}`);
    doc.moveDown(1);

    const sorted = [...reports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Summary stats
    const totalReports = sorted.length;
    const avgPoints =
      totalReports > 0 ? Math.round(sorted.reduce((sum, r) => sum + r.totalPoints, 0) / totalReports) : 0;
    const fullPrayerDays = sorted.filter(
      (r) => r.items.prayers.subuh && r.items.prayers.dzuhur && r.items.prayers.ashar && r.items.prayers.maghrib && r.items.prayers.isya,
    ).length;
    const totalTilawahPages = sorted.reduce((sum, r) => sum + r.items.tilawahPages, 0);

    doc.fontSize(11).fillColor(SLATE);
    doc.text(`Jumlah Laporan: ${totalReports}    Rata-rata Poin: ${avgPoints}    Sholat Lengkap 5 Waktu: ${fullPrayerDays} hari    Total Tilawah: ${totalTilawahPages} halaman`);
    doc.moveDown(1);

    // Table
    const tableTop = doc.y;
    const colX = { date: 40, prayers: 130, tilawah: 260, murajaah: 320, points: 385, comment: 440 };
    const rowHeight = 20;

    function drawHeader(y: number) {
      doc.fontSize(9).fillColor("#ffffff");
      doc.rect(40, y, 515, rowHeight).fill(EMERALD);
      doc.fillColor("#ffffff");
      doc.text("Tanggal", colX.date + 4, y + 6);
      doc.text("Sholat", colX.prayers + 4, y + 6);
      doc.text("Tilawah", colX.tilawah + 4, y + 6);
      doc.text("Murajaah", colX.murajaah + 4, y + 6);
      doc.text("Poin", colX.points + 4, y + 6);
      doc.text("Komentar Guru", colX.comment + 4, y + 6);
    }

    drawHeader(tableTop);
    let y = tableTop + rowHeight;

    sorted.forEach((r, i) => {
      if (y > 760) {
        doc.addPage();
        y = 40;
        drawHeader(y);
        y += rowHeight;
      }
      const prayerCount = Object.values(r.items.prayers).filter(Boolean).length;

      if (i % 2 === 0) {
        doc.rect(40, y, 515, rowHeight).fill("#f8fafc");
      }
      doc.fillColor(SLATE).fontSize(8.5);
      doc.text(format(new Date(r.date), "d MMM yyyy", { locale: idLocale }), colX.date + 4, y + 6);
      doc.text(`${prayerCount}/5`, colX.prayers + 4, y + 6);
      doc.text(`${r.items.tilawahPages} hal`, colX.tilawah + 4, y + 6);
      doc.text(`${r.items.murajaahMinutes} mnt`, colX.murajaah + 4, y + 6);
      doc.text(String(r.totalPoints), colX.points + 4, y + 6);
      doc.text(r.teacherComment ?? "-", colX.comment + 4, y + 6, { width: 110, height: rowHeight - 4, ellipsis: true });

      y += rowHeight;
    });

    // Detail appendix — surah rincian & book titles don't fit legibly inside the narrow table
    // columns above, so days with any rincian get a short line here instead, on their own page.
    const daysWithDetail = sorted.filter(
      (r) =>
        (r.items.tilawahDetails?.length ?? 0) > 0 ||
        (r.items.murajaahDetails?.length ?? 0) > 0 ||
        !!r.items.bookTitle,
    );

    if (daysWithDetail.length > 0) {
      doc.addPage();
      doc.fontSize(13).fillColor(EMERALD).text("Rincian Tilawah, Murajaah & Bacaan Buku");
      doc.moveDown(0.5);

      daysWithDetail.forEach((r) => {
        if (doc.y > 760) {
          doc.addPage();
        }

        const dateLabel = format(new Date(r.date), "d MMM yyyy", { locale: idLocale });
        const lines: string[] = [];

        const tilawahText = formatQuranDetails(r.items.tilawahDetails);
        if (tilawahText) lines.push(`Tilawah: ${tilawahText}`);

        const murajaahText = formatQuranDetails(r.items.murajaahDetails);
        if (murajaahText) lines.push(`Murajaah: ${murajaahText}`);

        if (r.items.bookTitle) lines.push(`Buku: ${r.items.bookTitle}`);

        doc.fontSize(9.5).fillColor(SLATE).text(dateLabel);
        doc.fontSize(8.5).fillColor(SLATE_LIGHT).text(lines.join("   •   "));
        doc.moveDown(0.5);
      });
    }

    doc.end();
  });
}