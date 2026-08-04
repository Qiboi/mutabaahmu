"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { CreateSchoolInput, UpdateSchoolInput } from "../schemas/school.schema";
import type { ISchool } from "@/models/School";

const SCHOOL_KEY = ["school"] as const;

export function useSchool() {
  return useQuery({
    queryKey: SCHOOL_KEY,
    queryFn: () => apiClient<ISchool | null>("/api/schools"),
  });
}

export function useSetupSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSchoolInput) =>
      apiClient<ISchool>("/api/schools", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHOOL_KEY }),
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSchoolInput) =>
      apiClient<ISchool>("/api/schools", { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHOOL_KEY }),
  });
}
