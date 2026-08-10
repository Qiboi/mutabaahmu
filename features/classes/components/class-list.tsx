"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, School as SchoolIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useClasses, useUpdateClass } from "../hooks/use-classes";
import { ClassFormDialog } from "./class-form-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToast } from "@/components/shared/toast-provider";
import type { IClassRoom } from "@/models/ClassRoom";

const PAGE_SIZE = 10;

export function ClassList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IClassRoom | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<IClassRoom | null>(null);
  const { data, isLoading } = useClasses({ search: debouncedSearch || undefined, page, limit: PAGE_SIZE });
  const updateMutation = useUpdateClass();
  const { showToast } = useToast();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(classRoom: IClassRoom) {
    setEditing(classRoom);
    setDialogOpen(true);
  }

  function handleStatusClick(classRoom: IClassRoom) {
    if (classRoom.isActive) {
      setConfirmTarget(classRoom);
    } else {
      updateMutation.mutate(
        { id: classRoom._id.toString(), input: { isActive: true } },
        {
          onSuccess: () => showToast(`Kelas "${classRoom.name}" berhasil diaktifkan`),
          onError: (err) => showToast(err.message, "error"),
        },
      );
    }
  }

  function confirmDeactivate() {
    if (!confirmTarget) return;
    const name = confirmTarget.name;
    updateMutation.mutate(
      { id: confirmTarget._id.toString(), input: { isActive: false } },
      {
        onSuccess: () => {
          setConfirmTarget(null);
          showToast(`Kelas "${name}" berhasil dinonaktifkan`);
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
          placeholder="Cari nama kelas..."
          className="max-w-xs"
        />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Kelas
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={SchoolIcon}
            title="Belum ada kelas"
            description="Tambahkan kelas pertama untuk mulai mengelola siswa."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Tambah Kelas
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Wali Kelas</TableHead>
                  <TableHead>Jumlah Siswa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((c) => (
                  <TableRow key={c._id.toString()}>
                    <TableCell className="font-medium text-slate-900">
                      <Link
                        href={`/dashboard/admin/classes/${c._id.toString()}`}
                        className="hover:text-emerald-700 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>Kelas {c.grade}</TableCell>
                    <TableCell>
                      {(c.homeroomTeacherId as unknown as { name?: string })?.name ?? (
                        <Badge variant="gray">Belum ditentukan</Badge>
                      )}
                    </TableCell>
                    <TableCell>{c.studentCount}</TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "default" : "gray"}>
                        {c.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Ubah">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() => handleStatusClick(c)}
                        >
                          {c.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <ClassFormDialog open={dialogOpen} onOpenChange={setDialogOpen} classRoom={editing} />
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Nonaktifkan Kelas?"
        description={
          confirmTarget
            ? `Kelas "${confirmTarget.name}" akan disembunyikan dari daftar kelas aktif. Anda bisa mengaktifkannya kembali kapan saja.`
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
