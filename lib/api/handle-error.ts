import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth/require-user";
import { TooManyRequestsError } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";

/** Central place every API route funnels caught errors through, so responses stay consistent. */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, message: err.message },
      { status: 401 },
    );
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, message: err.message },
      { status: 403 },
    );
  }
  if (err instanceof TooManyRequestsError) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, message: err.message },
      { status: 429 },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        message: "Data tidak valid",
        errors: err.flatten().fieldErrors as Record<string, string[]>,
      },
      { status: 422 },
    );
  }
  if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, message: "Data sudah ada (duplikat)" },
      { status: 409 },
    );
  }

  console.error("[API]", err);
  return NextResponse.json<ApiResponse<never>>(
    { success: false, message: "Terjadi kesalahan pada server" },
    { status: 500 },
  );
}

export function ok<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json<ApiResponse<T>>({ success: true, data, message }, { status });
}
