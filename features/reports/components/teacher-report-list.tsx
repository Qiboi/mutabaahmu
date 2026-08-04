"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ClipboardList, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyClasses } from "@/features/classes/hooks/use-classes";
import { useDailyReports } from "../hooks/use-daily-reports";
import { TeacherCommentForm } from "./teacher-comment-form";
import { ClassMonthlyExportButton } from "./export-buttons";
import { TeacherClassOverview } from "@/features/dashboard/components/teacher-class-overview";
import type { IDailyReport } from "@/models/DailyReport";

function prayerCount(report: IDailyReport) {
  return Object.values(report.items.prayers).filter(Boolean).length;
}

export function TeacherReportList({ teacherId }: { teacherId: string }) {
  const { data: classesResult, isLoading: isLoadingClasses } = useMyClasses(teacherId);
  const [classId, setClassId] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const selectedDate = new Date(dateStr);
  const { data: reportsResult, isLoading: isLoadingReports } = useDailyReports({
    classId: classId || undefined,
    from: selectedDate,
    to: selectedDate,
    limit: 100,
  });

  const classes = classesResult?.items ?? [];

  // Auto-select the teacher's first class once classes finish loading.
  useEffect(() => {
    const firstClassId = classes[0]?._id.toString();
    if (!classId && firstClassId) {
      setClassId(firstClassId);
    }
  }, [classId, classes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="classId">Kelas</Label>
          {isLoadingClasses ? (
            <Skeleton className="h-11 w-48" />
          ) : (
            <Select
              id="classId"
              className="w-48"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              {classes.length === 0 && <option value="">Belum ada kelas diampu</option>}
              {classes.map((c) => (
                <option key={c._id.toString()} value={c._id.toString()}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Tanggal</Label>
          <Input id="date" type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-44" />
        </div>
        {classId && (
          <div className="space-y-1.5">
            <Label>&nbsp;</Label>
            <ClassMonthlyExportButton classId={classId} month={selectedDate} />
          </div>
        )}
      </div>

      <TeacherClassOverview classId={classId || undefined} date={selectedDate} />

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-900">Detail Laporan per Siswa</p>
      </div>

      {isLoadingReports ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !reportsResult || reportsResult.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Belum ada laporan"
            description={`Belum ada siswa yang mengisi laporan untuk ${format(selectedDate, "d MMMM yyyy", { locale: idLocale })}.`}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reportsResult.items.map((report) => {
            const student = report.studentId as unknown as { fullName?: string; _id: string };
            const prayers = prayerCount(report);
            return (
              <Card key={report._id.toString()}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{student.fullName ?? "Siswa"}</p>
                      <p className="text-xs text-slate-500">
                        Total Poin: <span className="font-medium text-emerald-700">{report.totalPoints}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={prayers === 5 ? "default" : "amber"}>
                        {prayers === 5 ? (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        ) : (
                          <Circle className="mr-1 h-3 w-3" />
                        )}
                        Sholat {prayers}/5
                      </Badge>
                      <Badge variant={report.status === "reviewed" ? "default" : "gray"}>
                        {report.status === "reviewed" ? "Sudah Dikomentari" : "Menunggu Komentar"}
                      </Badge>
                    </div>
                  </div>
                  <TeacherCommentForm
                    reportId={report._id.toString()}
                    existingComment={report.teacherComment}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
