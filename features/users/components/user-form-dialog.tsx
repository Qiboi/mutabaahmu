"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserSchema, type CreateUserInput } from "../schemas/user.schema";
import { useCreateUser } from "../hooks/use-users";
import { guardedClose } from "@/utils/guarded-close";
import { useToast } from "@/components/shared/toast-provider";

export function UserFormDialog({
  open,
  onOpenChange,
  defaultRole,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole: "teacher" | "parent";
}) {
  const createMutation = useCreateUser();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: defaultRole, phone: "" },
  });
  const closeDialog = guardedClose(isDirty, onOpenChange);

  useEffect(() => {
    if (open) reset({ name: "", email: "", password: "", role: defaultRole, phone: "" });
  }, [open, defaultRole, reset]);

  function onSubmit(values: CreateUserInput) {
    createMutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        showToast(`Akun "${values.name}" berhasil dibuat`);
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={closeDialog}
      title={defaultRole === "teacher" ? "Tambah Akun Guru" : "Tambah Akun Orang Tua"}
      description="Akun akan langsung aktif dan bisa dipakai untuk login."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {createMutation.error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {createMutation.error.message}
          </div>
        )}

        <input type="hidden" {...register("role")} />

        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input id="name" placeholder="Ust. Fulan, S.Pd." {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password Awal</Label>
            <Input id="password" type="text" placeholder="Minimal 8 karakter" {...register("password")} />
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telepon</Label>
            <Input id="phone" placeholder="Opsional" {...register("phone")} />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Sampaikan email &amp; password ini langsung ke yang bersangkutan. Password bisa diganti
          nanti lewat fitur ganti password (belum tersedia di versi ini).
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => closeDialog(false)}>
            Batal
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Buat Akun
          </Button>
        </div>
      </form>
    </Dialog>
  );
}