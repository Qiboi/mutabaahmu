"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useAnnouncements } from "../hooks/use-announcements";

const AUDIENCE_LABEL: Record<string, string> = {
  all: "Semua",
  teachers: "Guru",
  parents: "Orang Tua",
  class: "Kelas Tertentu",
};

const PAGE_SIZE = 10;

export function AnnouncementList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAnnouncements({ page, limit: PAGE_SIZE });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Megaphone}
          title="Belum ada pengumuman"
          description="Pengumuman dari sekolah akan muncul di sini."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.items.map((a) => (
        <Card key={a._id.toString()}>
          <CardContent className="pt-6">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold text-slate-900">{a.title}</p>
              <Badge variant="blue">{AUDIENCE_LABEL[a.audience] ?? a.audience}</Badge>
            </div>
            <p className="whitespace-pre-line text-sm text-slate-600">{a.body}</p>
            <p className="mt-3 text-xs text-slate-400">
              {format(new Date(a.publishedAt), "d MMMM yyyy, HH:mm", { locale: idLocale })}
            </p>
          </CardContent>
        </Card>
      ))}
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        limit={data.limit}
        onPageChange={setPage}
      />
    </div>
  );
}
