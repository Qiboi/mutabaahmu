"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  createAnnouncementSchema,
  type CreateAnnouncementInput,
} from "../schemas/announcement.schema";
import { useCreateAnnouncement } from "../hooks/use-announcements";
import { useToast } from "@/components/shared/toast-provider";

export function AnnouncementForm() {
  const createMutation = useCreateAnnouncement();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAnnouncementInput>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: { title: "", body: "", audience: "all" },
  });

  function onSubmit(values: CreateAnnouncementInput) {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        showToast("Pengumuman berhasil dipublikasikan");
      },
      onError: (err) => showToast(err.message, "error"),
    });
  }

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-emerald-600" />
          Buat Pengumuman
        </CardTitle>
        <CardDescription>Pengumuman akan langsung tampil untuk audiens yang dipilih.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {createMutation.error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createMutation.error.message}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" placeholder="Libur Semester Ganjil" {...register("title")} />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Isi Pengumuman</Label>
            <Textarea id="body" placeholder="Tuliskan detail pengumuman..." {...register("body")} />
            {errors.body && <p className="text-xs text-red-600">{errors.body.message}</p>}
          </div>

          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="audience">Audiens</Label>
            <Select id="audience" {...register("audience")}>
              <option value="all">Semua Orang</option>
              <option value="teachers">Guru Saja</option>
              <option value="parents">Orang Tua Saja</option>
            </Select>
          </div>

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Publikasikan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
