"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { PaginatedResult } from "@/types";
import type { UserDTO } from "../services/user.dto";
import type { CreateUserInput, ListUserQuery, UpdateUserInput } from "../schemas/user.schema";

const USERS_KEY = ["users"] as const;

function toQueryString(query: Partial<ListUserQuery>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.toString();
}

export function useUsers(query: Partial<ListUserQuery> = {}) {
  return useQuery({
    queryKey: [...USERS_KEY, query],
    queryFn: () => apiClient<PaginatedResult<UserDTO>>(`/api/users?${toQueryString(query)}`),
  });
}

/** Convenience: all teachers, for "assign teacher to class" dropdowns. */
export function useTeachers() {
  return useUsers({ role: "teacher", limit: 100 });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      apiClient<UserDTO>("/api/users", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      apiClient<UserDTO>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: USERS_KEY });
      const previousQueries = queryClient.getQueriesData<PaginatedResult<UserDTO>>({
        queryKey: USERS_KEY,
      });

      queryClient.setQueriesData<PaginatedResult<UserDTO>>({ queryKey: USERS_KEY }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) => (item.id === id ? { ...item, ...input } : item)),
        };
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
