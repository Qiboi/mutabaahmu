"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { IActivityLog } from "@/models/ActivityLog";
import type { ActivityAction } from "@/constants/activity-log";
import type { PaginatedResult } from "@/types";

export function useActivityLogs(
  filters: { entityType?: string; action?: ActivityAction; page?: number; limit?: number } = {},
) {
  const params = new URLSearchParams();
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.action) params.set("action", filters.action);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["activity-logs", filters],
    queryFn: () =>
      apiClient<PaginatedResult<IActivityLog>>(`/api/activity-logs?${params.toString()}`),
  });
}
