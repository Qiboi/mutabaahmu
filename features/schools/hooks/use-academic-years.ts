"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { IAcademicYear } from "@/models/AcademicYear";
import type { CreateAcademicYearInput } from "../schemas/academic-year.schema";

const ACADEMIC_YEARS_KEY = ["academic-years"] as const;

export function useAcademicYears() {
  return useQuery({
    queryKey: ACADEMIC_YEARS_KEY,
    queryFn: () => apiClient<IAcademicYear[]>("/api/academic-years"),
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAcademicYearInput) =>
      apiClient<IAcademicYear>("/api/academic-years", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_KEY }),
  });
}

export function useActivateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<IAcademicYear>(`/api/academic-years/${id}/activate`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_KEY }),
  });
}
