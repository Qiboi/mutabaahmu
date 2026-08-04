import { NextResponse } from "next/server";
import { registerSchema } from "@/features/auth/schemas/auth.schema";
import { authService, AuthError, RateLimitError } from "@/features/auth/services/auth.service";
import { getClientIp } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";
import type { SessionUser } from "@/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const response: ApiResponse<never> = {
      success: false,
      message: "Data tidak valid",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
    return NextResponse.json(response, { status: 422 });
  }

  try {
    const user = await authService.register(parsed.data, getClientIp(request));
    const response: ApiResponse<SessionUser> = {
      success: true,
      data: user,
      message: "Registrasi berhasil",
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof RateLimitError) {
      const response: ApiResponse<never> = { success: false, message: err.message };
      return NextResponse.json(response, { status: 429 });
    }
    if (err instanceof AuthError) {
      const response: ApiResponse<never> = { success: false, message: err.message };
      return NextResponse.json(response, { status: 409 });
    }
    console.error("[POST /api/auth/register]", err);
    const response: ApiResponse<never> = {
      success: false,
      message: "Terjadi kesalahan pada server",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
