import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError, ok } from "@/lib/api/handle-error";
import { createStudentSchema, listStudentQuerySchema } from "@/features/students/schemas/student.schema";
import { studentService } from "@/features/students/services/student.service";
import { ROLES } from "@/constants/roles";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const query = listStudentQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    // Parents only ever see their own linked children, regardless of query params.
    if (user.role === ROLES.PARENT) {
      const students = await studentService.getForParent(user.id);
      return ok(students);
    }

    const result = await studentService.list(query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]);
    const body = await request.json();
    const input = createStudentSchema.parse(body);
    const student = await studentService.create(input, user.id);
    return ok(student, "Siswa berhasil ditambahkan", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
