import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { updateUserSchema } from "@/features/users/schemas/user.schema";
import {
  userService,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "@/features/users/services/user.service";
import { ROLES } from "@/constants/roles";
import type { ApiResponse } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const admin = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const { id } = await params;
    const body = await request.json();
    const input = updateUserSchema.parse(body);
    const user = await userService.update(id, input, admin.id);
    return ok(user, "Akun berhasil diperbarui");
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: err.message },
        { status: 404 },
      );
    }
    if (err instanceof UserAlreadyExistsError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: err.message },
        { status: 409 },
      );
    }
    return handleApiError(err);
  }
}
