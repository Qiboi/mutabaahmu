"use client";

import { useMemo, useState } from "react";
import { useForm, useFieldArray, Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
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
  Plus,
  Trash2,
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
import { SURAH_LIST } from "@/constants/surah";
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

/**
 * Dynamic list of "surah + ayat range" entries, shared by the Tilawah and Murajaah sections.
 * A day can have several sessions (e.g. finishing one surah then starting the next), so this
 * is a field array rather than a single fixed surah/ayat pair.
 */
function QuranSessionFieldArray({
  control,
  register,
  setValue,
  errors,
  name,
  label,
}: {
  control: Control<CreateDailyReportInput>;
  register: UseFormRegister<CreateDailyReportInput>;
  setValue: UseFormSetValue<CreateDailyReportInput>;
  errors: FieldErrors<CreateDailyReportInput>;
  name: "tilawahDetails" | "murajaahDetails";
  label: string;
}) {
  const fieldName = `items.${name}` as const;
  const { fields, append, remove } = useFieldArray({ control, name: fieldName });

  const fieldErrors = errors.items?.[name];
  const rootMessage = !Array.isArray(fieldErrors) ? fieldErrors?.message : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={fields.length >= 10}
          onClick={() => append({ surahNumber: 0, surahName: "", ayatFrom: 1, ayatTo: 1 })}
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Surat
        </Button>
      </div>

      {rootMessage && <p className="text-xs text-red-600">{rootMessage}</p>}

      {fields.length === 0 && (
        <p className="text-xs text-slate-400">Belum ada rincian surat ditambahkan.</p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const entryErrors = Array.isArray(fieldErrors) ? fieldErrors[index] : undefined;

          return (
            <div
              key={field.id}
              className="flex flex-wrap items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="min-w-44 flex-1 space-y-1">
                <Controller
                  control={control}
                  name={`${fieldName}.${index}.surahNumber`}
                  render={({ field: surahField }) => (
                    <Select
                      value={surahField.value || ""}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        surahField.onChange(num);
                        const surah = SURAH_LIST.find((s) => s.number === num);
                        setValue(`${fieldName}.${index}.surahName`, surah?.name ?? "");
                      }}
                    >
                      <option value="">Pilih surat</option>
                      {SURAH_LIST.map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.number}. {s.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
                {entryErrors?.surahNumber && (
                  <p className="text-xs text-red-600">{entryErrors.surahNumber.message}</p>
                )}
              </div>

              <div className="w-24 space-y-1">
                <Input
                  type="number"
                  min={1}
                  placeholder="Ayat dari"
                  {...register(`${fieldName}.${index}.ayatFrom`)}
                />
                {entryErrors?.ayatFrom && (
                  <p className="text-xs text-red-600">{entryErrors.ayatFrom.message}</p>
                )}
              </div>

              <div className="w-24 space-y-1">
                <Input
                  type="number"
                  min={1}
                  placeholder="Ayat sampai"
                  {...register(`${fieldName}.${index}.ayatTo`)}
                />
                {entryErrors?.ayatTo && (
                  <p className="text-xs text-red-600">{entryErrors.ayatTo.message}</p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                aria-label="Hapus rincian surat"
                className="mt-0.5 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
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
    setValue,
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
        tilawahDetails: [],
        murajaahMinutes: 0,
        murajaahDetails: [],
        infak: false,
        helpingParents: false,
        readingMinutes: 0,
        bookTitle: "",
        wakeUpEarly: false,
        notes: "",
      },
    },
  });

  const selectedStudentId = watch("studentId");
  const readingMinutes = watch("items.readingMinutes");

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

          <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">Tilawah Al-Qur&apos;an</legend>
            <div className="max-w-40 space-y-1.5">
              <Label htmlFor="tilawahPages">Jumlah Halaman</Label>
              <Input
                id="tilawahPages"
                type="number"
                min={0}
                max={30}
                {...register("items.tilawahPages")}
              />
            </div>
            <QuranSessionFieldArray
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
              name="tilawahDetails"
              label="Rincian Surat"
            />
          </fieldset>

          <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">Murajaah</legend>
            <div className="max-w-40 space-y-1.5">
              <Label htmlFor="murajaahMinutes">Durasi (menit)</Label>
              <Input
                id="murajaahMinutes"
                type="number"
                min={0}
                {...register("items.murajaahMinutes")}
              />
            </div>
            <QuranSessionFieldArray
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
              name="murajaahDetails"
              label="Rincian Surat"
            />
          </fieldset>

          <fieldset className="space-y-3 rounded-2xl border border-slate-100 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">Membaca Buku</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="readingMinutes">Durasi (menit)</Label>
                <Input
                  id="readingMinutes"
                  type="number"
                  min={0}
                  {...register("items.readingMinutes")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bookTitle">
                  Judul Buku {readingMinutes > 0 && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="bookTitle"
                  placeholder="Misal: Kisah 25 Nabi dan Rasul"
                  {...register("items.bookTitle")}
                />
                {errors.items?.bookTitle && (
                  <p className="text-xs text-red-600">{errors.items.bookTitle.message}</p>
                )}
              </div>
            </div>
          </fieldset>

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