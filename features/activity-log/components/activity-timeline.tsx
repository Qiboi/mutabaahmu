"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  History,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  Download,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useActivityLogs } from "../hooks/use-activity-logs";
import type { ActivityAction } from "@/constants/activity-log";

const ACTION_ICONS: Record<ActivityAction, LucideIcon> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  login: LogIn,
  export: Download,
  promote_class: GraduationCap,
};

const ACTION_LABELS: Record<ActivityAction, string> = {
  create: "Dibuat",
  update: "Diperbarui",
  delete: "Dihapus/Diarsipkan",
  login: "Masuk",
  export: "Ekspor",
  promote_class: "Kenaikan Kelas",
};

const ACTION_TONE: Record<ActivityAction, string> = {
  create: "bg-emerald-50 text-emerald-600",
  update: "bg-blue-50 text-blue-600",
  delete: "bg-red-50 text-red-600",
  login: "bg-slate-100 text-slate-600",
  export: "bg-amber-50 text-amber-600",
  promote_class: "bg-emerald-50 text-emerald-600",
};

const ENTITY_TYPES = ["Student", "ClassRoom", "School", "AcademicYear", "Announcement", "User"];
const PAGE_SIZE = 10;

export function ActivityTimeline() {
  const [entityType, setEntityType] = useState<string>("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useActivityLogs({
    entityType: entityType || undefined,
    page,
    limit: PAGE_SIZE,
  });

  function handleEntityTypeChange(value: string) {
    setEntityType(value);
    setPage(1);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Riwayat Aktivitas</p>
          <div className="w-48 space-y-1">
            <Label htmlFor="entityType" className="sr-only">
              Filter jenis data
            </Label>
            <Select id="entityType" value={entityType} onChange={(e) => handleEntityTypeChange(e.target.value)}>
              <option value="">Semua Jenis</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={History} title="Belum ada aktivitas tercatat" className="py-10" />
        ) : (
          <>
            <ul className="space-y-1">
              {data.items.map((log) => {
                const Icon = ACTION_ICONS[log.action];
                const actor = log.actorId as unknown as { name?: string } | undefined;
                return (
                  <li key={log._id.toString()} className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ACTION_TONE[log.action]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800">{log.description}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {actor?.name ?? "Sistem"} ·{" "}
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: idLocale })}
                      </p>
                    </div>
                    <Badge variant="gray">{ACTION_LABELS[log.action]}</Badge>
                  </li>
                );
              })}
            </ul>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
