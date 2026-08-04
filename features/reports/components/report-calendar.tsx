"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyReports } from "../hooks/use-daily-reports";
import { ReportDetailDialog } from "./report-detail-dialog";
import { StudentExportButtons } from "./export-buttons";
import type { IDailyReport } from "@/models/DailyReport";

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function scoreTone(points: number): string {
  if (points >= 80) return "bg-emerald-500 text-white";
  if (points >= 50) return "bg-emerald-200 text-emerald-800";
  if (points > 0) return "bg-amber-200 text-amber-800";
  return "bg-slate-100 text-slate-400";
}

const UNIFORM_FILLED_TONE = "bg-emerald-500 text-white";

export function ReportCalendar({
  studentId,
  classId,
  hidePoints = false,
}: {
  studentId: string | undefined;
  classId?: string;
  /** Parent view: hides point totals and uses one uniform color for any filled day, so
   *  consistent, honest daily reporting isn't subtly discouraged by a "low score" color. */
  hidePoints?: boolean;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedReport, setSelectedReport] = useState<IDailyReport | null>(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  const { data, isLoading } = useDailyReports({
    studentId,
    classId,
    from: monthStart,
    to: monthEnd,
    limit: 31,
  });

  const reportsByDay = useMemo(() => {
    const map = new Map<string, IDailyReport>();
    data?.items.forEach((r) => map.set(format(new Date(r.date), "yyyy-MM-dd"), r));
    return map;
  }, [data]);

  if (!studentId) return null;

  const monthKey = format(month, "yyyy-MM");

  return (
    <Card className="overflow-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))} aria-label="Bulan sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="min-w-32 text-center text-sm font-semibold text-slate-900">
            {format(month, "MMMM yyyy", { locale: idLocale })}
          </p>
          <Button variant="ghost" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Bulan berikutnya">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <StudentExportButtons studentId={studentId} from={monthStart} to={monthEnd} />
      </div>

      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_LABELS.map((d) => (
              <div
                key={d}
                className="rounded-md bg-slate-50 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              >
                {d}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={monthKey}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="grid grid-cols-7 gap-1.5"
            >
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const report = reportsByDay.get(key);
                const inMonth = isSameMonth(day, month);
                const filledTone = hidePoints ? UNIFORM_FILLED_TONE : scoreTone(report?.totalPoints ?? 0);

                return (
                  <button
                    key={key}
                    disabled={!report}
                    onClick={() => report && setSelectedReport(report)}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all duration-150",
                      !inMonth && "opacity-25",
                      report
                        ? cn(filledTone, "cursor-pointer shadow-sm hover:scale-105 hover:shadow-md active:scale-95")
                        : "text-slate-400",
                      isToday(day) && "ring-2 ring-gold-500 ring-offset-1",
                    )}
                  >
                    <span className={isSameDay(day, new Date()) ? "font-semibold" : ""}>{format(day, "d")}</span>
                    {report?.teacherComment && (
                      <MessageSquare className="absolute bottom-1 right-1 h-2.5 w-2.5" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {hidePoints ? (
              <>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Sudah Mengisi
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" /> Belum Mengisi
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Tinggi (≥80)
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-200" /> Sedang (50-79)
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-200" /> Rendah (&lt;50)
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" /> Belum Lapor
                </span>
              </>
            )}
          </div>
        </>
      )}

      <ReportDetailDialog
        report={selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
        hidePoints={hidePoints}
      />
    </Card>
  );
}