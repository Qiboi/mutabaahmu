import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { createUserSchema, listUserQuerySchema } from "@/features/users/schemas/user.schema";
import { userService, UserAlreadyExistsError } from "@/features/users/services/user.service";
import { ROLES } from "@/constants/roles";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const query = listUserQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await userService.list(query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const body = await request.json();
    const input = createUserSchema.parse(body);
    const user = await userService.create(input, admin.id);
    return ok(user, "Akun berhasil dibuat", 201);
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: err.message },
        { status: 409 },
      );
    }
    return handleApiError(err);
  }
}
