"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface AdminStats {
  totalStudents: number;
  totalClasses: number;
  totalParents: number;
  completionRateToday: number;
  mostActiveClass: { classId: string; name: string; rate: number } | null;
  leastActiveClass: { classId: string; name: string; rate: number } | null;
  parentParticipationRate: number;
  last7Days: { date: string; completionRate: number }[];
  classRates: { classId: string; name: string; rate: number }[];
}

export interface TeacherClassStats {
  totalStudents: number;
  submittedCount: number;
  notSubmittedStudents: { studentId: string; fullName: string }[];
  weeklyCount: number;
  monthlyCount: number;
  bestConsistency: { studentId: string; fullName: string; currentStreakDays: number }[];
}

export interface ClassTrendPoint {
  date: string;
  completionRate: number;
  avgPoints: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: () => apiClient<AdminStats>("/api/dashboard/admin"),
  });
}

export function useClassTrend(classId: string | undefined, days = 14) {
  return useQuery({
    queryKey: ["dashboard", "class-trend", classId, days],
    queryFn: () =>
      apiClient<{ totalStudents: number; trend: ClassTrendPoint[] }>(
        `/api/dashboard/class-trend?classId=${classId}&days=${days}`,
      ),
    enabled: !!classId,
  });
}

export function useTeacherClassStats(classId: string | undefined, date: Date) {
  return useQuery({
    queryKey: ["dashboard", "teacher", classId, date.toISOString().slice(0, 10)],
    queryFn: () =>
      apiClient<TeacherClassStats>(
        `/api/dashboard/teacher?classId=${classId}&date=${date.toISOString()}`,
      ),
    enabled: !!classId,
  });
}
