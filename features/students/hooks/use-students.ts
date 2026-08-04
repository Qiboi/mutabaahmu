"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { PaginatedResult } from "@/types";
import type { IStudent } from "@/models/Student";
import type {
  CreateStudentInput,
  ListStudentQuery,
  UpdateStudentInput,
} from "../schemas/student.schema";

const STUDENTS_KEY = ["students"] as const;

function toQueryString(query: Partial<ListStudentQuery>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.toString();
}

export function useStudents(query: Partial<ListStudentQuery> = {}) {
  return useQuery({
    queryKey: [...STUDENTS_KEY, query],
    queryFn: () => apiClient<PaginatedResult<IStudent> | IStudent[]>(`/api/students?${toQueryString(query)}`),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStudentInput) =>
      apiClient<IStudent>("/api/students", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStudentInput }) =>
      apiClient<IStudent>(`/api/students/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: STUDENTS_KEY });
      const previousQueries = queryClient.getQueriesData<PaginatedResult<IStudent> | IStudent[]>({
        queryKey: STUDENTS_KEY,
      });

      queryClient.setQueriesData<PaginatedResult<IStudent> | IStudent[]>(
        { queryKey: STUDENTS_KEY },
        (old) => {
          if (!old) return old;
          const patchItem = (item: IStudent): IStudent =>
            item._id.toString() === id ? ({ ...item, ...input } as IStudent) : item;
          return Array.isArray(old) ? old.map(patchItem) : { ...old, items: old.items.map(patchItem) };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Roll back to the pre-mutation cache snapshot — the optimistic edit didn't stick.
      context?.previousQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });
}

export function useArchiveStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient<IStudent>(`/api/students/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });
}

/** For the parent role: GET /api/students returns a plain array of their own linked children. */
export function useMyChildren() {
  return useQuery({
    queryKey: [...STUDENTS_KEY, "mine"],
    queryFn: () => apiClient<IStudent[]>("/api/students"),
  });
}
