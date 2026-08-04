"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyClasses } from "@/features/classes/hooks/use-classes";
import { useStudents } from "@/features/students/hooks/use-students";
import { ReportCalendar } from "./report-calendar";
import type { PaginatedResult } from "@/types";
import type { IStudent } from "@/models/Student";

export function TeacherHistoryView({ teacherId }: { teacherId: string }) {
  const { data: classesResult, isLoading: isLoadingClasses } = useMyClasses(teacherId);
  const [classId, setClassId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");

  const classes = classesResult?.items ?? [];

  useEffect(() => {
    const firstClassId = classes[0]?._id.toString();
    if (firstClassId && !classId) setClassId(firstClassId);
  }, [classes, classId]);

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ classId: classId || undefined, limit: 100 });
  const studentsResult = studentsData as PaginatedResult<IStudent> | undefined;
  const students = studentsResult?.items ?? [];

  useEffect(() => {
    const firstStudentId = students[0]?._id.toString();
    if (firstStudentId && (!studentId || !students.some((s) => s._id.toString() === studentId))) {
      setStudentId(firstStudentId);
    }
  }, [students, studentId]);

  if (isLoadingClasses) return <Skeleton className="h-96 w-full" />;

  if (classes.length === 0) {
    return (
      <Card>
        <EmptyState icon={Users} title="Belum ada kelas yang diampu" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="max-w-xs flex-1 space-y-1.5">
          <Label htmlFor="classId">Kelas</Label>
          <Select id="classId" value={classId} onChange={(e) => setClassId(e.target.value)}>
            {classes.map((c) => (
              <option key={c._id.toString()} value={c._id.toString()}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="max-w-xs flex-1 space-y-1.5">
          <Label htmlFor="studentId">Siswa</Label>
          {isLoadingStudents ? (
            <Skeleton className="h-11 w-full" />
          ) : (
            <Select id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {students.length === 0 && <option value="">Belum ada siswa</option>}
              {students.map((s) => (
                <option key={s._id.toString()} value={s._id.toString()}>
                  {s.fullName}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      <ReportCalendar studentId={studentId || undefined} classId={classId || undefined} />
    </div>
  );
}
