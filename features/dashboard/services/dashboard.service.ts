import { dashboardRepository } from "@/repositories/dashboard.repository";

export const dashboardService = {
  getAdminStats: () => dashboardRepository.getAdminStats(),
  getTeacherClassStats: (classId: string, date: Date) =>
    dashboardRepository.getTeacherClassStats(classId, date),
  getClassTrend: (classId: string, days?: number) => dashboardRepository.getClassTrend(classId, days),
};
