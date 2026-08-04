"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { IAnnouncement } from "@/models/Announcement";
import type { PaginatedResult } from "@/types";
import type { CreateAnnouncementInput } from "../schemas/announcement.schema";

const ANNOUNCEMENTS_KEY = ["announcements"] as const;

export function useAnnouncements(params: { page?: number; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  return useQuery({
    queryKey: [...ANNOUNCEMENTS_KEY, params],
    queryFn: () => apiClient<PaginatedResult<IAnnouncement>>(`/api/announcements?${query.toString()}`),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) =>
      apiClient<IAnnouncement>("/api/announcements", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY }),
  });
}
