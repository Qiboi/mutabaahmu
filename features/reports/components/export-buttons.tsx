"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

function triggerDownload(url: string) {
  // Same-origin GET with Content-Disposition: attachment — browser downloads instead of navigating.
  window.location.href = url;
}

export function StudentExportButtons({
  studentId,
  from,
  to,
}: {
  studentId: string;
  from: Date;
  to: Date;
}) {
  const params = new URLSearchParams({
    studentId,
    from: from.toISOString(),
    to: to.toISOString(),
  }).toString();

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => triggerDownload(`/api/exports/student-summary-excel?${params}`)}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => triggerDownload(`/api/exports/student-summary-pdf?${params}`)}
      >
        <FileText className="h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}

export function ClassMonthlyExportButton({ classId, month }: { classId: string; month: Date }) {
  const params = new URLSearchParams({
    classId,
    year: String(month.getFullYear()),
    month: String(month.getMonth() + 1),
  }).toString();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => triggerDownload(`/api/exports/monthly-excel?${params}`)}
    >
      <FileSpreadsheet className="h-4 w-4" />
      Export Bulanan (Excel)
    </Button>
  );
}
