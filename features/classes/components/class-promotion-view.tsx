"use client";

import { useEffect, useState } from "react";
import { ArrowRight, GraduationCap, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useClasses } from "../hooks/use-classes";
import { useStudents } from "@/features/students/hooks/use-students";
import { usePromoteClass } from "../hooks/use-promotion";
import { useToast } from "@/components/shared/toast-provider";
import type { PaginatedResult } from "@/types";
import type { IStudent } from "@/models/Student";

export function ClassPromotionView() {
  const { data: classesResult, isLoading: isLoadingClasses } = useClasses({ limit: 100 });
  const classes = classesResult?.items ?? [];

  const [fromClassId, setFromClassId] = useState("");
  const [toClassId, setToClassId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const promoteMutation = usePromoteClass();
  const { showToast } = useToast();

  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    classId: fromClassId || undefined,
    limit: 100,
  });
  const studentsResult = studentsData as PaginatedResult<IStudent> | undefined;
  const students = studentsResult?.items ?? [];

  // Reset & default-select-all whenever the source class (or its student list) changes.
  useEffect(() => {
    const result = studentsData as PaginatedResult<IStudent> | undefined;
    setSelectedIds(new Set((result?.items ?? []).map((s) => s._id.toString())));
  }, [fromClassId, studentsData]);

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmPromote() {
    promoteMutation.mutate(
      { fromClassId, toClassId, studentIds: Array.from(selectedIds) },
      {
        onSuccess: (result) => {
          setFromClassId("");
          setToClassId("");
          setSelectedIds(new Set());
          setConfirmOpen(false);
          showToast(
            `${result.movedCount} siswa berhasil dipindahkan dari ${result.fromClassName} ke ${result.toClassName}`,
          );
        },
        onError: (err) => showToast(err.message, "error"),
      },
    );
  }

  const canSubmit = fromClassId && toClassId && fromClassId !== toClassId && selectedIds.size > 0;
  const fromClassName = classes.find((c) => c._id.toString() === fromClassId)?.name ?? "";
  const toClassName = classes.find((c) => c._id.toString() === toClassId)?.name ?? "";

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-emerald-600" />
          Kenaikan Kelas
        </CardTitle>
        <CardDescription>
          Pindahkan siswa dari satu kelas ke kelas lain, misalnya di akhir tahun ajaran.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {promoteMutation.error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {promoteMutation.error.message}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1 space-y-1.5">
            <Label htmlFor="fromClassId">Dari Kelas</Label>
            {isLoadingClasses ? (
              <Skeleton className="h-11 w-full" />
            ) : (
              <Select id="fromClassId" value={fromClassId} onChange={(e) => setFromClassId(e.target.value)}>
                <option value="">Pilih kelas asal</option>
                {classes.map((c) => (
                  <option key={c._id.toString()} value={c._id.toString()}>
                    {c.name} ({c.studentCount} siswa)
                  </option>
                ))}
              </Select>
            )}
          </div>

          <ArrowRight className="mb-2.5 h-5 w-5 shrink-0 text-slate-400" />

          <div className="min-w-48 flex-1 space-y-1.5">
            <Label htmlFor="toClassId">Ke Kelas</Label>
            {isLoadingClasses ? (
              <Skeleton className="h-11 w-full" />
            ) : (
              <Select id="toClassId" value={toClassId} onChange={(e) => setToClassId(e.target.value)}>
                <option value="">Pilih kelas tujuan</option>
                {classes
                  .filter((c) => c._id.toString() !== fromClassId)
                  .map((c) => (
                    <option key={c._id.toString()} value={c._id.toString()}>
                      {c.name} ({c.studentCount} siswa)
                    </option>
                  ))}
              </Select>
            )}
          </div>
        </div>

        {fromClassId && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Pilih Siswa yang Dipindahkan ({selectedIds.size}/{students.length})
            </p>
            {isLoadingStudents ? (
              <Skeleton className="h-40 w-full" />
            ) : students.length === 0 ? (
              <EmptyState icon={GraduationCap} title="Tidak ada siswa aktif di kelas ini" className="py-8" />
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-[var(--radius-control)] border border-slate-200 p-2">
                {students.map((s) => (
                  <label
                    key={s._id.toString()}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={selectedIds.has(s._id.toString())}
                      onChange={() => toggleStudent(s._id.toString())}
                    />
                    {s.fullName}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <Button onClick={() => setConfirmOpen(true)} disabled={!canSubmit || promoteMutation.isPending}>
          {promoteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Pindahkan {selectedIds.size > 0 ? `${selectedIds.size} Siswa` : "Siswa"}
        </Button>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Pindahkan Siswa Antar Kelas?"
        description={`${selectedIds.size} siswa akan dipindahkan dari kelas "${fromClassName}" ke "${toClassName}". Tindakan ini akan langsung mengubah data kelas siswa yang dipilih.`}
        confirmLabel={`Ya, Pindahkan ${selectedIds.size} Siswa`}
        tone="danger"
        isLoading={promoteMutation.isPending}
        onConfirm={confirmPromote}
      />
    </Card>
  );
}
