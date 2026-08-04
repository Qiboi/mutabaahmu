"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { idOf } from "@/utils/object-id";
import type { PaginatedResult } from "@/types";
import type { IClassRoom } from "@/models/ClassRoom";
import type {
  CreateClassInput,
  ListClassQuery,
  UpdateClassInput,
} from "../schemas/class.schema";

const CLASSES_KEY = ["classes"] as const;

function toQueryString(query: Partial<ListClassQuery>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.toString();
}

export function useClasses(query: Partial<ListClassQuery> = {}) {
  return useQuery({
    queryKey: [...CLASSES_KEY, query],
    queryFn: () =>
      apiClient<PaginatedResult<IClassRoom>>(`/api/classes?${toQueryString(query)}`),
  });
}

/** Single-class fetch with full populate (homeroomTeacherId, teacherIds, academicYearId) - use
 *  this for class detail views instead of scanning a paginated list for the matching id. */
export function useClass(id: string | undefined) {
  return useQuery({
    queryKey: [...CLASSES_KEY, "detail", id],
    queryFn: () => apiClient<IClassRoom>(`/api/classes/${id}`),
    enabled: !!id,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassInput) =>
      apiClient<IClassRoom>("/api/classes", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClassInput }) =>
      apiClient<IClassRoom>(`/api/classes/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: CLASSES_KEY });
      const previousQueries = queryClient.getQueriesData<PaginatedResult<IClassRoom> | IClassRoom>({
        queryKey: CLASSES_KEY,
      });

      queryClient.setQueriesData<PaginatedResult<IClassRoom> | IClassRoom>(
        { queryKey: CLASSES_KEY },
        (old) => {
          if (!old) return old;
          // Single-class detail cache (useClass(id)) is a bare IClassRoom, not a paginated result.
          if ("_id" in old) {
            return old._id.toString() === id ? ({ ...old, ...input } as IClassRoom) : old;
          }
          return {
            ...old,
            items: old.items.map((item) =>
              item._id.toString() === id ? ({ ...item, ...input } as IClassRoom) : item,
            ),
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
  });
}

export function useArchiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient<IClassRoom>(`/api/classes/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASSES_KEY }),
  });
}

/** Convenience: fetch classes then filter client-side to ones the current teacher is assigned to.
 *  (The /api/classes list endpoint itself is admin/teacher-readable; server-side per-class access
 *  is still enforced on GET /api/classes/[id].) `homeroomTeacherId` arrives populated (an object
 *  with `_id`), so `idOf()` extracts the underlying id string either way. */
export function useMyClasses(teacherId: string) {
  const query = useClasses({ limit: 100 });
  return {
    ...query,
    data: query.data
      ? {
          ...query.data,
          items: query.data.items.filter(
            (c) =>
              idOf(c.homeroomTeacherId) === teacherId ||
              c.teacherIds.some((t) => idOf(t) === teacherId),
          ),
        }
      : query.data,
  };
}
