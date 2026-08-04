"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createClassSchema, type CreateClassInput } from "../schemas/class.schema";
import { useCreateClass, useUpdateClass } from "../hooks/use-classes";
import { useAcademicYears } from "@/features/schools/hooks/use-academic-years";
import { useTeachers } from "@/features/users/hooks/use-users";
import { idOf } from "@/utils/object-id";
import { guardedClose } from "@/utils/guarded-close";
import { useToast } from "@/components/shared/toast-provider";
import type { IClassRoom } from "@/models/ClassRoom";

export function ClassFormDialog({
  open,
  onOpenChange,
  classRoom,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classRoom?: IClassRoom | null;
}) {
  const { data: academicYears } = useAcademicYears();
  const { data: teachersResult } = useTeachers();
  const teachers = teachersResult?.items ?? [];
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const { showToast } = useToast();
  const isEdit = !!classRoom;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateClassInput>({
    resolver: zodResolver(createClassSchema),
    defaultValues: { name: "", grade: 1, academicYearId: "", teacherIds: [] },
  });
  const closeDialog = guardedClose(isDirty, onOpenChange);

  useEffect(() => {
    if (open) {
      reset(
        classRoom
          ? {
              name: classRoom.name,
              grade: classRoom.grade,
              academicYearId: idOf(classRoom.academicYearId),
              homeroomTeacherId: idOf(classRoom.homeroomTeacherId),
              teacherIds: classRoom.teacherIds.map((t) => idOf(t) as string),
            }
          : { name: "", grade: 1, academicYearId: "", teacherIds: [] },
      );
    }
  }, [open, classRoom, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;
  const selectedHomeroomId = watch("homeroomTeacherId");

  function onSubmit(values: CreateClassInput) {
    if (isEdit && classRoom) {
      updateMutation.mutate(
        { id: classRoom._id.toString(), input: values },
        {
          onSuccess: () => {
            onOpenChange(false);
            showToast(`Kelas "${values.name}" berhasil diperbarui`);
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          onOpenChange(false);
          showToast(`Kelas "${values.name}" berhasil ditambahkan`);
        },
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={closeDialog}
      title={isEdit ? "Ubah Kelas" : "Tambah Kelas Baru"}
      description={isEdit ? "Perbarui detail kelas ini." : "Buat kelas baru untuk tahun ajaran aktif."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mutationError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {mutationError.message}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Kelas</Label>
          <Input id="name" placeholder="3A - Al Fatih" {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="grade">Tingkat</Label>
            <Select id="grade" {...register("grade")}>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  Kelas {g}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="academicYearId">Tahun Ajaran</Label>
            <Select id="academicYearId" {...register("academicYearId")}>
              <option value="">Pilih tahun ajaran</option>
              {academicYears?.map((y) => (
                <option key={y._id.toString()} value={y._id.toString()}>
                  {y.label} — {y.semester}
                </option>
              ))}
            </Select>
            {errors.academicYearId && (
              <p className="text-xs text-red-600">{errors.academicYearId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="homeroomTeacherId">Wali Kelas</Label>
          <Select id="homeroomTeacherId" {...register("homeroomTeacherId")}>
            <option value="">Belum ditentukan</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>

        {teachers.length > 0 && (
          <div className="space-y-1.5">
            <Label>Guru Pendamping (opsional)</Label>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded-(--radius-control) border border-slate-200 p-2">
              {teachers
                .filter((t) => t.id !== selectedHomeroomId)
                .map((t) => (
                  <Controller
                    key={t.id}
                    control={control}
                    name="teacherIds"
                    render={({ field }) => {
                      const checked = (field.value ?? []).includes(t.id);
                      return (
                        <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                          <Checkbox
                            checked={checked}
                            onChange={(e) => {
                              const current = field.value ?? [];
                              field.onChange(
                                e.target.checked
                                  ? [...current, t.id]
                                  : current.filter((id) => id !== t.id),
                              );
                            }}
                          />
                          {t.name}
                        </label>
                      );
                    }}
                  />
                ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => closeDialog(false)}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Simpan" : "Buat Kelas"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}