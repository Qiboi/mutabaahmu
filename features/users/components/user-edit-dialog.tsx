"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateUserSchema, type UpdateUserInput } from "../schemas/user.schema";
import { useUpdateUser } from "../hooks/use-users";
import { guardedClose } from "@/utils/guarded-close";
import { useToast } from "@/components/shared/toast-provider";
import type { UserDTO } from "../services/user.dto";

export function UserEditDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDTO | null;
}) {
  const updateMutation = useUpdateUser();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: "", email: "", phone: "", status: "active", password: "" },
  });
  const closeDialog = guardedClose(isDirty, onOpenChange);

  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        status: user.status as "active" | "inactive" | "suspended",
        password: "",
      });
      setShowPassword(false);
    }
  }, [open, user, reset]);

  if (!user) return null;

  function onSubmit(values: UpdateUserInput) {
    if (!user) return;
    // Omit password entirely when left blank, so the backend knows "no change requested"
    // rather than treating an empty string as a password reset attempt.
    const { password, ...rest } = values;
    const input = password ? { ...rest, password } : rest;
    updateMutation.mutate(
      { id: user.id, input },
      {
        onSuccess: () => {
          onOpenChange(false);
          showToast(`Akun "${values.name}" berhasil diperbarui`);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog} title={`Ubah Akun: ${user.name}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {updateMutation.error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {updateMutation.error.message}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="edit-name">Nama Lengkap</Label>
          <Input id="edit-name" {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-email">Email</Label>
          <Input id="edit-email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Telepon</Label>
            <Input id="edit-phone" placeholder="Opsional" {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-status">Status</Label>
            <Select id="edit-status" {...register("status")}>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="suspended">Ditangguhkan</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-password">Ganti Password (opsional)</Label>
          <div className="relative">
            <Input
              id="edit-password"
              type={showPassword ? "text" : "password"}
              placeholder="Kosongkan jika tidak ingin mengganti"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => closeDialog(false)}>
            Batal
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Dialog>
  );
}