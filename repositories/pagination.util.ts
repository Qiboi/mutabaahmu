import type { PaginatedResult } from "@/types";

export function buildPagination(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export function toPaginatedResult<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResult<T> {
  return { items, ...buildPagination(page, limit, total) };
}
