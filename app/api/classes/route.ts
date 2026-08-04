import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { createClassSchema, listClassQuerySchema } from "@/features/classes/schemas/class.schema";
import { classService } from "@/features/classes/services/class.service";
import { ROLES } from "@/constants/roles";

export async function GET(request: NextRequest) {
  try {
    await requireUser();
    const query = listClassQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await classService.list(query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const body = await request.json();
    const input = createClassSchema.parse(body);
    const classRoom = await classService.create(input, user.id);
    return ok(classRoom, "Kelas berhasil dibuat", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
