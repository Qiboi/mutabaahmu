"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createAcademicYearSchema,
  type CreateAcademicYearInput,
} from "../schemas/academic-year.schema";
import { useCreateAcademicYear } from "../hooks/use-academic-years";
import { guardedClose } from "@/utils/guarded-close";
import { useToast } from "@/components/shared/toast-provider";

export function AcademicYearFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = useCreateAcademicYear();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateAcademicYearInput>({
    resolver: zodResolver(createAcademicYearSchema),
    defaultValues: { label: "", semester: "ganjil", startDate: undefined, endDate: undefined },
  });
  const closeDialog = guardedClose(isDirty, onOpenChange);

  function onSubmit(values: CreateAcademicYearInput) {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
        showToast(`Tahun ajaran "${values.label}" berhasil dibuat`);
      },
      onError: (err) => showToast(err.message, "error"),
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={closeDialog}
      title="Tambah Tahun Ajaran"
      description="Contoh label: 2026/2027."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {createMutation.error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {createMutation.error.message}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="label">Label Tahun Ajaran</Label>
          <Input id="label" placeholder="2026/2027" {...register("label")} />
          {errors.label && <p className="text-xs text-red-600">{errors.label.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="semester">Semester</Label>
          <Select id="semester" {...register("semester")}>
            <option value="ganjil">Ganjil</option>
            <option value="genap">Genap</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Input id="startDate" type="date" {...register("startDate")} />
            {errors.startDate && <p className="text-xs text-red-600">{errors.startDate.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">Tanggal Selesai</Label>
            <Input id="endDate" type="date" {...register("endDate")} />
            {errors.endDate && <p className="text-xs text-red-600">{errors.endDate.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => closeDialog(false)}>
            Batal
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Buat Tahun Ajaran
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
