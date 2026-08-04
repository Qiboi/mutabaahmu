import type { ApiResponse } from "@/types";

export class ApiClientError extends Error {
  errors?: Record<string, string[]>;
  status: number;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/**
 * If the session has expired (401), redirect to /login with the current path preserved as
 * callbackUrl — instead of leaving the user looking at a scattered "Anda harus login" error
 * message inline in whatever component happened to be fetching at the time. A full navigation
 * (not client-side router.push) is used deliberately: it also clears any stale client-side
 * state/cache tied to the now-invalid session.
 */
export function handleSessionExpiry() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return; // avoid a redirect loop
  const callbackUrl = encodeURIComponent(window.location.pathname);
  window.location.href = `/login?callbackUrl=${callbackUrl}`;
}

/** Thin wrapper around fetch() for our own /api routes: parses the ApiResponse envelope and throws on failure. */
export async function apiClient<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!body.success) {
    if (response.status === 401) {
      handleSessionExpiry();
    }
    throw new ApiClientError(body.message, response.status, body.errors);
  }

  return body.data;
}
