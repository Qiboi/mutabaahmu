"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Loader2,
  CheckCircle2,
  Send,
  Users,
  Sunrise,
  Sun,
  SunMedium,
  Sunset,
  Moon,
  Star,
  HandCoins,
  HeartHandshake,
  AlarmClock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createDailyReportSchema,
  type CreateDailyReportInput,
} from "../schemas/daily-report.schema";
import { useSubmitDailyReport } from "../hooks/use-daily-reports";
import { useMyChildren } from "@/features/students/hooks/use-students";
import { ApiClientError } from "@/lib/api/client";

const PRAYER_LABELS: {
  key: keyof CreateDailyReportInput["items"]["prayers"];
  label: string;
  icon: LucideIcon;
}[] = [
    { key: "subuh", label: "Subuh", icon: Sunrise },
    { key: "dzuhur", label: "Dzuhur", icon: Sun },
    { key: "ashar", label: "Ashar", icon: SunMedium },
    { key: "maghrib", label: "Maghrib", icon: Sunset },
    { key: "isya", label: "Isya", icon: Moon },
  ];

const HABIT_TOGGLES: {
  key: "sunnahPrayer" | "infak" | "helpingParents" | "wakeUpEarly";
  label: string;
  icon: LucideIcon;
}[] = [
    { key: "sunnahPrayer", label: "Sholat Sunnah", icon: Star },
    { key: "infak", label: "Infak", icon: HandCoins },
    { key: "helpingParents", label: "Membantu Orang Tua", icon: HeartHandshake },
    { key: "wakeUpEarly", label: "Bangun Pagi", icon: AlarmClock },
  ];

function ToggleChip({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 px-2 py-3 text-center transition-all duration-150",
        checked
          ? "border-emerald-500 bg-emerald-50 shadow-(--shadow-soft)"
          : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
          checked
            ? "scale-100 bg-emerald-500 text-white"
            : "scale-90 bg-slate-100 text-slate-400 group-hover:scale-95 group-hover:bg-slate-200",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("text-xs font-medium transition-colors", checked ? "text-emerald-700" : "text-slate-600")}>
        {label}
      </span>
    </label>
  );
}

export function DailyReportForm() {
  const { data: children, isLoading: isLoadingChildren } = useMyChildren();
  const submitMutation = useSubmitDailyReport();
  const [justSubmittedFor, setJustSubmittedFor] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const todayLabel = format(today, "EEEE, d MMMM yyyy", { locale: idLocale });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateDailyReportInput>({
    resolver: zodResolver(createDailyReportSchema),
    defaultValues: {
      studentId: "",
      date: today,
      items: {
        prayers: { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false },
        sunnahPrayer: false,
        tilawahPages: 0,
        murajaahMinutes: 0,
        infak: false,
        helpingParents: false,
        readingMinutes: 0,
        wakeUpEarly: false,
        notes: "",
      },
    },
  });

  const selectedStudentId = watch("studentId");

  function onSubmit(values: CreateDailyReportInput) {
    submitMutation.mutate(values, {
      onSuccess: () => {
        setJustSubmittedFor(values.studentId);
        reset({ ...values, items: { ...values.items, notes: "" } });
      },
    });
  }

  if (isLoadingChildren) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!children || children.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Belum ada anak yang terhubung"
          description="Hubungi admin sekolah untuk menautkan akun Anda dengan data siswa."
        />
      </Card>
    );
  }

  const error = submitMutation.error;
  const isDuplicateError = error instanceof ApiClientError && error.status === 409;

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <CardTitle>Laporan Harian</CardTitle>
        <CardDescription>{todayLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div
              role="alert"
              className={`rounded-(--radius-control) border px-4 py-3 text-sm ${isDuplicateError
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-red-200 bg-red-50 text-red-700"
                }`}
            >
              {error.message}
            </div>
          )}
          {justSubmittedFor === selectedStudentId && submitMutation.isSuccess && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-(--radius-control) border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Laporan berhasil disimpan. Terima kasih sudah mendampingi ananda hari ini!
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="studentId">Nama Anak</Label>
            <Select id="studentId" {...register("studentId")}>
              <option value="">Pilih anak</option>
              {children.map((child) => (
                <option key={child._id.toString()} value={child._id.toString()}>
                  {child.fullName}
                </option>
              ))}
            </Select>
            {errors.studentId && <p className="text-xs text-red-600">{errors.studentId.message}</p>}
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-700">Sholat 5 Waktu</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {PRAYER_LABELS.map((prayer) => (
                <Controller
                  key={prayer.key}
                  control={control}
                  name={`items.prayers.${prayer.key}`}
                  render={({ field }) => (
                    <ToggleChip
                      icon={prayer.icon}
                      label={prayer.label}
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-700">Kebiasaan Baik</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {HABIT_TOGGLES.map((habit) => (
                <Controller
                  key={habit.key}
                  control={control}
                  name={`items.${habit.key}`}
                  render={({ field }) => (
                    <ToggleChip
                      icon={habit.icon}
                      label={habit.label}
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="tilawahPages">Tilawah (halaman)</Label>
              <Input
                id="tilawahPages"
                type="number"
                min={0}
                max={30}
                {...register("items.tilawahPages")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="murajaahMinutes">Murajaah (menit)</Label>
              <Input
                id="murajaahMinutes"
                type="number"
                min={0}
                {...register("items.murajaahMinutes")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="readingMinutes">Membaca Buku (menit)</Label>
              <Input
                id="readingMinutes"
                type="number"
                min={0}
                {...register("items.readingMinutes")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan Tambahan (opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Ceritakan hal baik lain yang dilakukan ananda hari ini..."
              {...register("items.notes")}
            />
          </div>

          <Button type="submit" className="w-full sm:w-auto" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Simpan Laporan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}