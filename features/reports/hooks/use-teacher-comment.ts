"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { IDailyReport } from "@/models/DailyReport";
import type { TeacherCommentInput } from "../schemas/daily-report.schema";

export function useAddTeacherComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TeacherCommentInput }) =>
      apiClient<IDailyReport>(`/api/reports/${id}/comment`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily-reports"] }),
  });
}
