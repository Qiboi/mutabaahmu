"use client";

import { UserX, CalendarDays, CalendarRange, Medal, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "./stat-card";
import { useTeacherClassStats } from "../hooks/use-dashboard-stats";

export function TeacherClassOverview({ classId, date }: { classId: string | undefined; date: Date }) {
  const { data: stats, isLoading } = useTeacherClassStats(classId, date);

  if (!classId) return null;

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          label="Sudah Lapor Hari Ini"
          value={`${stats.submittedCount}/${stats.totalStudents}`}
          tone="emerald"
        />
        <StatCard icon={CalendarDays} label="Laporan 7 Hari Terakhir" value={stats.weeklyCount} tone="blue" />
        <StatCard icon={CalendarRange} label="Laporan 30 Hari Terakhir" value={stats.monthlyCount} tone="blue" />
        <StatCard
          icon={UserX}
          label="Belum Lapor Hari Ini"
          value={stats.notSubmittedStudents.length}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-2">
              <UserX className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-semibold text-slate-900">Belum Mengisi Laporan Hari Ini</p>
            </div>
            {stats.notSubmittedStudents.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Semua siswa sudah lapor!"
                description="Kerja bagus, seluruh siswa di kelas ini sudah mengisi laporan hari ini."
                className="py-8"
              />
            ) : (
              <ul className="max-h-[224px] space-y-2 overflow-y-auto pr-1">
                {stats.notSubmittedStudents.map((s) => (
                  <li
                    key={s.studentId}
                    className="flex items-center justify-between rounded-(--radius-control) bg-amber-50 px-3 py-2 text-sm text-amber-800"
                  >
                    {s.fullName}
                    <Badge variant="amber">Belum Lapor</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-3 flex items-center gap-2">
              <Medal className="h-4 w-4 text-gold-600" />
              <p className="text-sm font-semibold text-slate-900">Konsistensi Terbaik</p>
            </div>
            {stats.bestConsistency.length === 0 ? (
              <EmptyState icon={Medal} title="Belum ada data" className="py-8" />
            ) : (
              <ul className="space-y-2">
                {stats.bestConsistency.map((s, i) => (
                  <li
                    key={s.studentId}
                    className="flex items-center justify-between rounded-(--radius-control) border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-100 text-[11px] font-semibold text-gold-700">
                        {i + 1}
                      </span>
                      {s.fullName}
                    </span>
                    <Badge variant="gold">{s.currentStreakDays} hari beruntun</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}