"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { IAchievement } from "@/models/Achievement";

export function useStudentAchievements(studentId: string | undefined) {
  return useQuery({
    queryKey: ["achievements", studentId],
    queryFn: () => apiClient<IAchievement[]>(`/api/achievements?studentId=${studentId}`),
    enabled: !!studentId,
  });
}
