"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useStudents, useUpdateStudent } from "../hooks/use-students";
import { StudentFormDialog } from "./student-form-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToast } from "@/components/shared/toast-provider";
import type { IStudent } from "@/models/Student";
import type { PaginatedResult } from "@/types";

const PAGE_SIZE = 10;

export function StudentList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IStudent | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<IStudent | null>(null);
  const { data, isLoading } = useStudents({ search: debouncedSearch || undefined, page, limit: PAGE_SIZE });
  const updateMutation = useUpdateStudent();
  const { showToast } = useToast();

  // Admin/teacher callers get a PaginatedResult; parent callers get a plain array (not used on this page).
  const result = data as PaginatedResult<IStudent> | undefined;

  // Reset to page 1 only once the debounced search actually changes (not on every keystroke).
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(student: IStudent) {
    setEditing(student);
    setDialogOpen(true);
  }

  function handleStatusClick(student: IStudent) {
    // Only deactivating needs confirmation — reactivating is low-risk and easily reversible.
    if (student.isActive) {
      setConfirmTarget(student);
    } else {
      updateMutation.mutate(
        { id: student._id.toString(), input: { isActive: true } },
        {
          onSuccess: () => showToast(`"${student.fullName}" berhasil diaktifkan`),
          onError: (err) => showToast(err.message, "error"),
        },
      );
    }
  }

  function confirmDeactivate() {
    if (!confirmTarget) return;
    const name = confirmTarget.fullName;
    updateMutation.mutate(
      { id: confirmTarget._id.toString(), input: { isActive: false } },
      {
        onSuccess: () => {
          setConfirmTarget(null);
          showToast(`"${name}" berhasil dinonaktifkan`);
        },
        onError: (err) => showToast(err.message, "error"),
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama siswa..."
          className="max-w-xs"
        />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : !result || result.items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada siswa"
            description="Tambahkan siswa pertama untuk kelas ini."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Tambah Siswa
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((s) => (
                  <TableRow key={s._id.toString()}>
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                          {s.avatarUrl ? (
                            <Image src={s.avatarUrl} alt={s.fullName} fill className="object-cover" sizes="32px" />
                          ) : (
                            <User className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        {s.fullName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(s.classId as unknown as { name?: string })?.name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? "default" : "gray"}>
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Ubah">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() => handleStatusClick(s)}
                        >
                          {s.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              limit={result.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <StudentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} student={editing} />
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Nonaktifkan Siswa?"
        description={
          confirmTarget
            ? `"${confirmTarget.fullName}" akan disembunyikan dari daftar aktif dan tidak bisa lagi menerima laporan harian baru. Anda bisa mengaktifkannya kembali kapan saja.`
            : undefined
        }
        confirmLabel="Ya, Nonaktifkan"
        tone="danger"
        isLoading={updateMutation.isPending}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
