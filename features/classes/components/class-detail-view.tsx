"use client";

import Image from "next/image";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { GraduationCap, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useClass } from "../hooks/use-classes";
import { useStudents } from "@/features/students/hooks/use-students";
import { useClassTrend } from "@/features/dashboard/hooks/use-dashboard-stats";
import { TeacherClassOverview } from "@/features/dashboard/components/teacher-class-overview";
import type { IStudent } from "@/models/Student";
import type { PaginatedResult } from "@/types";

function TeacherName({ teacher }: { teacher: unknown }) {
  const t = teacher as { name?: string } | undefined;
  return t?.name ? <span>{t.name}</span> : <Badge variant="gray">Belum ditentukan</Badge>;
}

export function ClassDetailView({ classId }: { classId: string }) {
  const { data: classRoom, isLoading: isLoadingClass } = useClass(classId);

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ classId, limit: 100 });
  const studentsResult = studentsData as PaginatedResult<IStudent> | undefined;
  const students = studentsResult?.items ?? [];

  const { data: trendData, isLoading: isLoadingTrend } = useClassTrend(classId, 14);

  if (isLoadingClass) return <Skeleton className="h-64 w-full" />;
  if (!classRoom) {
    return (
      <Card>
        <EmptyState icon={GraduationCap} title="Kelas tidak ditemukan" />
      </Card>
    );
  }

  const academicYear = classRoom.academicYearId as unknown as { label?: string; semester?: string } | undefined;
  const assistantTeachers = (classRoom.teacherIds as unknown as { name?: string }[]) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tingkat</p>
            <p className="mt-1 font-semibold text-slate-900">Kelas {classRoom.grade}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tahun Ajaran</p>
            <p className="mt-1 font-semibold text-slate-900">
              {academicYear?.label ?? "-"} {academicYear?.semester ? `(${academicYear.semester})` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Jumlah Siswa</p>
            <p className="mt-1 font-semibold text-slate-900">{classRoom.studentCount} siswa</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Wali Kelas</p>
            <p className="mt-1 flex items-center gap-1.5 font-semibold text-slate-900">
              <User className="h-4 w-4 text-emerald-600" />
              <TeacherName teacher={classRoom.homeroomTeacherId} />
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Guru Pendamping</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {assistantTeachers.length === 0 ? (
                <span className="text-sm text-slate-400">Tidak ada</span>
              ) : (
                assistantTeachers.map((t, i) => (
                  <Badge key={i} variant="blue">
                    {t.name}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <TeacherClassOverview classId={classId} date={new Date()} />

      <Card>
        <CardHeader className="flex-col items-start">
          <CardTitle>Tren Kelas 14 Hari Terakhir</CardTitle>
          <CardDescription>Completion rate dan rata-rata poin harian kelas ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTrend ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData?.trend.map((t) => ({
                    ...t,
                    label: format(new Date(t.date), "d MMM", { locale: idLocale }),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgPoints"
                    name="Rata-rata Poin"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col items-start">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            Daftar Siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStudents ? (
            <Skeleton className="h-40 w-full" />
          ) : students.length === 0 ? (
            <EmptyState icon={Users} title="Belum ada siswa di kelas ini" className="py-8" />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {students.map((s) => (
                <li
                  key={s._id.toString()}
                  className="flex items-center gap-3 rounded-[var(--radius-control)] border border-slate-100 px-3 py-2"
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                    {s.avatarUrl ? (
                      <Image src={s.avatarUrl} alt={s.fullName} fill className="object-cover" sizes="36px" />
                    ) : (
                      <User className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{s.fullName}</p>
                    <p className="text-xs text-slate-400">{s.gender === "male" ? "Laki-laki" : "Perempuan"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
