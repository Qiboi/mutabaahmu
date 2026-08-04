"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { PaginatedResult } from "@/types";
import type { IDailyReport } from "@/models/DailyReport";
import type {
  CreateDailyReportInput,
  ListDailyReportQuery,
} from "../schemas/daily-report.schema";

const REPORTS_KEY = ["daily-reports"] as const;

function toQueryString(query: Partial<ListDailyReportQuery>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    params.set(key, value instanceof Date ? value.toISOString() : String(value));
  });
  return params.toString();
}

export function useDailyReports(query: Partial<ListDailyReportQuery> = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, query],
    queryFn: () =>
      apiClient<PaginatedResult<IDailyReport>>(`/api/reports?${toQueryString(query)}`),
    enabled: !!(query.studentId || query.classId),
  });
}

export function useSubmitDailyReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDailyReportInput) =>
      apiClient<IDailyReport>("/api/reports", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REPORTS_KEY }),
  });
}
