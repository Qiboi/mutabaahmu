"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { PromoteClassInput } from "../schemas/promotion.schema";

interface PromotionResult {
  movedCount: number;
  fromClassName: string;
  toClassName: string;
}

export function usePromoteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PromoteClassInput) =>
      apiClient<PromotionResult>("/api/classes/promote", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
