"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, UserCog, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUpdateUser, useUsers } from "../hooks/use-users";
import { UserFormDialog } from "./user-form-dialog";
import { UserEditDialog } from "./user-edit-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToast } from "@/components/shared/toast-provider";
import type { UserDTO } from "../services/user.dto";

const TABS = [
  { role: "teacher" as const, label: "Guru" },
  { role: "parent" as const, label: "Orang Tua" },
];

const PAGE_SIZE = 10;

const STATUS_VARIANT: Record<string, "default" | "gray" | "red"> = {
  active: "default",
  inactive: "gray",
  suspended: "red",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  suspended: "Ditangguhkan",
};

export function UserList() {
  const [activeRole, setActiveRole] = useState<"teacher" | "parent">("teacher");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserDTO | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<UserDTO | null>(null);

  const { data, isLoading } = useUsers({
    role: activeRole,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const updateMutation = useUpdateUser();
  const { showToast } = useToast();

  // Reset to page 1 once the debounced search settles (not on every keystroke).
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  function handleStatusClick(user: UserDTO) {
    if (user.status === "active") {
      setConfirmTarget(user);
    } else {
      updateMutation.mutate(
        { id: user.id, input: { status: "active" } },
        {
          onSuccess: () => showToast(`Akun "${user.name}" berhasil diaktifkan`),
          onError: (err) => showToast(err.message, "error"),
        },
      );
    }
  }

  function confirmDeactivate() {
    if (!confirmTarget) return;
    const name = confirmTarget.name;
    updateMutation.mutate(
      { id: confirmTarget.id, input: { status: "inactive" } },
      {
        onSuccess: () => {
          setConfirmTarget(null);
          showToast(`Akun "${name}" berhasil dinonaktifkan`);
        },
        onError: (err) => showToast(err.message, "error"),
      },
    );
  }

  function handleTabChange(role: "teacher" | "parent") {
    setActiveRole(role);
    setSearch("");
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.role}
            onClick={() => handleTabChange(tab.role)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeRole === tab.role
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Cari nama atau email ${activeRole === "teacher" ? "guru" : "orang tua"}...`}
          className="max-w-xs"
        />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah {activeRole === "teacher" ? "Guru" : "Orang Tua"}
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            icon={activeRole === "teacher" ? UserCog : UsersIcon}
            title={`Belum ada akun ${activeRole === "teacher" ? "guru" : "orang tua"}`}
            action={
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Tambah {activeRole === "teacher" ? "Guru" : "Orang Tua"}
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-slate-900">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[u.status]}>{STATUS_LABEL[u.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditing(u)} aria-label="Ubah">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateMutation.isPending}
                          onClick={() => handleStatusClick(u)}
                        >
                          {u.status === "active" ? "Nonaktifkan" : "Aktifkan"}
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

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} defaultRole={activeRole} />
      <UserEditDialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)} user={editing} />
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Nonaktifkan Akun?"
        description={
          confirmTarget
            ? `"${confirmTarget.name}" tidak akan bisa login sampai diaktifkan kembali. Anda bisa mengaktifkannya kembali kapan saja.`
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
