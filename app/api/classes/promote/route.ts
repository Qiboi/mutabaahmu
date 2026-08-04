import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { promoteClassSchema } from "@/features/classes/schemas/promotion.schema";
import { promotionService, PromotionError } from "@/features/classes/services/promotion.service";
import { ROLES } from "@/constants/roles";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const body = await request.json();
    const input = promoteClassSchema.parse(body);
    const result = await promotionService.promote(input, user.id);
    return ok(result, `${result.movedCount} siswa berhasil dipindahkan`);
  } catch (err) {
    if (err instanceof PromotionError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, message: err.message },
        { status: 422 },
      );
    }
    return handleApiError(err);
  }
}
