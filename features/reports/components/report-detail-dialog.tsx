"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CheckCircle2, XCircle, MessageSquare, BookOpen } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { IDailyReport } from "@/models/DailyReport";

const PRAYER_LABELS: { key: keyof IDailyReport["items"]["prayers"]; label: string }[] = [
  { key: "subuh", label: "Subuh" },
  { key: "dzuhur", label: "Dzuhur" },
  { key: "ashar", label: "Ashar" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isya", label: "Isya" },
];

function CheckRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
      <span className="text-slate-700">{label}</span>
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <XCircle className="h-4 w-4 text-slate-300" />
      )}
    </div>
  );
}

function QuranDetailList({
  entries,
  tone,
}: {
  entries: IDailyReport["items"]["tilawahDetails"];
  tone: "emerald" | "blue";
}) {
  if (!entries || entries.length === 0) return null;
  const toneClass = tone === "emerald" ? "bg-emerald-50 text-emerald-800" : "bg-blue-50 text-blue-800";

  return (
    <ul className="space-y-1.5">
      {entries.map((entry, i) => (
        <li key={i} className={`rounded-lg px-3 py-1.5 text-sm ${toneClass}`}>
          {entry.surahName} : ayat {entry.ayatFrom}–{entry.ayatTo}
        </li>
      ))}
    </ul>
  );
}

export function ReportDetailDialog({
  report,
  onOpenChange,
  hidePoints = false,
}: {
  report: IDailyReport | null;
  onOpenChange: (open: boolean) => void;
  hidePoints?: boolean;
}) {
  if (!report) return null;

  const hasTilawahDetails = (report.items.tilawahDetails?.length ?? 0) > 0;
  const hasMurajaahDetails = (report.items.murajaahDetails?.length ?? 0) > 0;

  return (
    <Dialog
      open={!!report}
      onOpenChange={onOpenChange}
      title={format(new Date(report.date), "EEEE, d MMMM yyyy", { locale: idLocale })}
      description={hidePoints ? undefined : `Total Poin: ${report.totalPoints}`}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Sholat 5 Waktu
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PRAYER_LABELS.map((p) => (
              <CheckRow key={p.key} label={p.label} done={report.items.prayers[p.key]} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Kebiasaan Baik
          </p>
          <div className="grid grid-cols-2 gap-2">
            <CheckRow label="Sholat Sunnah" done={report.items.sunnahPrayer} />
            <CheckRow label="Infak" done={report.items.infak} />
            <CheckRow label="Membantu Orang Tua" done={report.items.helpingParents} />
            <CheckRow label="Bangun Pagi" done={report.items.wakeUpEarly} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-emerald-50 px-3 py-2">
            <p className="font-semibold text-emerald-700">{report.items.tilawahPages}</p>
            <p className="text-xs text-emerald-600">Halaman Tilawah</p>
          </div>
          <div className="rounded-lg bg-blue-50 px-3 py-2">
            <p className="font-semibold text-blue-700">{report.items.murajaahMinutes}</p>
            <p className="text-xs text-blue-600">Menit Murajaah</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2">
            <p className="font-semibold text-amber-700">{report.items.readingMinutes}</p>
            <p className="text-xs text-amber-600">Menit Membaca</p>
          </div>
        </div>

        {hasTilawahDetails && (
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              Rincian Tilawah
            </p>
            <QuranDetailList entries={report.items.tilawahDetails} tone="emerald" />
          </div>
        )}

        {hasMurajaahDetails && (
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              Rincian Murajaah
            </p>
            <QuranDetailList entries={report.items.murajaahDetails} tone="blue" />
          </div>
        )}

        {report.items.bookTitle && (
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <BookOpen className="h-3.5 w-3.5" />
              Buku yang Dibaca
            </p>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {report.items.bookTitle}
            </p>
          </div>
        )}

        {report.items.notes && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              Catatan Orang Tua
            </p>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {report.items.notes}
            </p>
          </div>
        )}

        {report.teacherComment && (
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <MessageSquare className="h-3.5 w-3.5" />
              Komentar Guru
            </p>
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {report.teacherComment}
            </p>
          </div>
        )}

        <Badge variant={report.status === "reviewed" ? "default" : "gray"}>
          {report.status === "reviewed" ? "Sudah Dikomentari Guru" : "Menunggu Komentar Guru"}
        </Badge>
      </div>
    </Dialog>
  );
}