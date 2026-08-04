"use client";

import { useState } from "react";
import { Plus, CalendarClock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useAcademicYears, useActivateAcademicYear } from "../hooks/use-academic-years";
import { AcademicYearFormDialog } from "./academic-year-form-dialog";
import { useToast } from "@/components/shared/toast-provider";

export function AcademicYearList() {
  const { data: years, isLoading } = useAcademicYears();
  const activateMutation = useActivateAcademicYear();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showToast } = useToast();

  function handleActivate(id: string, label: string) {
    activateMutation.mutate(id, {
      onSuccess: () => showToast(`Tahun ajaran "${label}" berhasil diaktifkan`),
      onError: (err) => showToast(err.message, "error"),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Tahun Ajaran
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : !years || years.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Belum ada tahun ajaran"
            description="Tambahkan tahun ajaran pertama untuk mulai membuat kelas."
            action={
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Tambah Tahun Ajaran
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {years.map((y) => (
                <TableRow key={y._id.toString()}>
                  <TableCell className="font-medium text-slate-900">{y.label}</TableCell>
                  <TableCell className="capitalize">{y.semester}</TableCell>
                  <TableCell>
                    {format(new Date(y.startDate), "d MMM yyyy", { locale: idLocale })} —{" "}
                    {format(new Date(y.endDate), "d MMM yyyy", { locale: idLocale })}
                  </TableCell>
                  <TableCell className="text-right">
                    {y.isActive ? (
                      <Badge variant="default">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Aktif
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activateMutation.isPending}
                        onClick={() => handleActivate(y._id.toString(), y.label)}
                      >
                        Aktifkan
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AcademicYearFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
