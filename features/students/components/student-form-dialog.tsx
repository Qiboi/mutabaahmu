"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { createStudentSchema, type CreateStudentInput } from "../schemas/student.schema";
import { useCreateStudent, useUpdateStudent } from "../hooks/use-students";
import { useClasses } from "@/features/classes/hooks/use-classes";
import { useUsers } from "@/features/users/hooks/use-users";
import { idOf } from "@/utils/object-id";
import { guardedClose } from "@/utils/guarded-close";
import { useToast } from "@/components/shared/toast-provider";
import type { IStudent } from "@/models/Student";

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: IStudent | null;
}) {
  const { data: classesResult } = useClasses({ limit: 100 });
  const { data: parentsResult } = useUsers({ role: "parent", limit: 100 });
  const parents = parentsResult?.items ?? [];
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isEdit = !!student;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: { fullName: "", gender: "male", classId: "", parentIds: [] },
  });
  const closeDialog = guardedClose(isDirty, onOpenChange);

  useEffect(() => {
    if (open) {
      reset(
        student
          ? {
              fullName: student.fullName,
              nisn: student.nisn ?? "",
              gender: student.gender,
              classId: idOf(student.classId) as string,
              parentIds: student.parentIds.map((p) => idOf(p) as string),
            }
          : { fullName: "", gender: "male", classId: "", parentIds: [] },
      );
    }
  }, [open, student, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  function onSubmit(values: CreateStudentInput) {
    if (isEdit && student) {
      updateMutation.mutate(
        { id: student._id.toString(), input: values },
        {
          onSuccess: () => {
            onOpenChange(false);
            showToast(`Data "${values.fullName}" berhasil diperbarui`);
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          onOpenChange(false);
          showToast(`"${values.fullName}" berhasil ditambahkan`);
        },
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={closeDialog}
      title={isEdit ? "Ubah Data Siswa" : "Tambah Siswa Baru"}
      description={isEdit ? "Perbarui data siswa ini." : "Daftarkan siswa baru ke sebuah kelas."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mutationError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {mutationError.message}
          </div>
        )}

        {isEdit && student && (
          <div className="flex justify-center pb-1">
            <ImageUploadField
              currentUrl={student.avatarUrl}
              uploadUrl={`/api/students/${student._id.toString()}/photo`}
              alt={`Foto ${student.fullName}`}
              onUploaded={() => queryClient.invalidateQueries({ queryKey: ["students"] })}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input id="fullName" placeholder="Ahmad Fauzan" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nisn">NISN</Label>
            <Input id="nisn" placeholder="Opsional" {...register("nisn")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <Select id="gender" {...register("gender")}>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="classId">Kelas</Label>
          <Select id="classId" {...register("classId")}>
            <option value="">Pilih kelas</option>
            {classesResult?.items.map((c) => (
              <option key={c._id.toString()} value={c._id.toString()}>
                {c.name}
              </option>
            ))}
          </Select>
          {errors.classId && <p className="text-xs text-red-600">{errors.classId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Orang Tua/Wali (opsional, bisa lebih dari satu)</Label>
          {parents.length === 0 ? (
            <p className="text-xs text-slate-400">
              Belum ada akun orang tua. Tambahkan lewat menu &quot;Akun Guru &amp; Ortu&quot;.
            </p>
          ) : (
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-(--radius-control) border border-slate-200 p-2">
              {parents.map((p) => (
                <Controller
                  key={p.id}
                  control={control}
                  name="parentIds"
                  render={({ field }) => {
                    const checked = (field.value ?? []).includes(p.id);
                    return (
                      <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                        <Checkbox
                          checked={checked}
                          onChange={(e) => {
                            const current = field.value ?? [];
                            field.onChange(
                              e.target.checked
                                ? [...current, p.id]
                                : current.filter((id) => id !== p.id),
                            );
                          }}
                        />
                        {p.name} <span className="text-slate-400">({p.email})</span>
                      </label>
                    );
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => closeDialog(false)}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Simpan" : "Tambah Siswa"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}