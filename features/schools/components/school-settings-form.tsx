"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import {
  createSchoolSchema,
  type CreateSchoolInput,
} from "../schemas/school.schema";
import { useSchool, useSetupSchool, useUpdateSchool } from "../hooks/use-school";

export function SchoolSettingsForm() {
  const { data: school, isLoading } = useSchool();
  const setupMutation = useSetupSchool();
  const updateMutation = useUpdateSchool();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSchoolInput>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { name: "", npsn: "", address: "", phone: "", principalName: "" },
  });

  useEffect(() => {
    if (school) {
      reset({
        name: school.name,
        npsn: school.npsn ?? "",
        address: school.address ?? "",
        phone: school.phone ?? "",
        principalName: school.principalName ?? "",
      });
    }
  }, [school, reset]);

  const isSubmitting = setupMutation.isPending || updateMutation.isPending;

  function onSubmit(values: CreateSchoolInput) {
    if (school) {
      updateMutation.mutate(values);
    } else {
      setupMutation.mutate(values);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const mutationError = setupMutation.error ?? updateMutation.error;
  const mutationSuccess = setupMutation.isSuccess || updateMutation.isSuccess;

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <CardTitle>Profil Sekolah</CardTitle>
        <CardDescription>
          {school
            ? "Perbarui informasi dasar sekolah Anda."
            : "Lengkapi informasi ini untuk memulai menggunakan Mutabaah."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mutationError && (
            <div
              role="alert"
              className="rounded-[var(--radius-control)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {mutationError.message}
            </div>
          )}
          {mutationSuccess && (
            <div
              role="status"
              className="rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              Perubahan berhasil disimpan.
            </div>
          )}

          {school && (
            <div className="flex justify-center pb-1">
              <ImageUploadField
                currentUrl={school.logoUrl}
                uploadUrl="/api/schools/logo"
                alt="Logo sekolah"
                shape="rounded"
                onUploaded={() => queryClient.invalidateQueries({ queryKey: ["school"] })}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Nama Sekolah</Label>
              <Input id="name" placeholder="SDIT Al Fatih" {...register("name")} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="npsn">NPSN</Label>
              <Input id="npsn" placeholder="12345678" {...register("npsn")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" placeholder="021-xxxxxxx" {...register("phone")} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" placeholder="Jl. Pendidikan No. 1" {...register("address")} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="principalName">Nama Kepala Sekolah</Label>
              <Input id="principalName" placeholder="Ust. Fulan, S.Pd." {...register("principalName")} />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {school ? "Simpan Perubahan" : "Selesaikan Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
