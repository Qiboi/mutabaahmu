import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { ROLE_ALLOWED_PREFIXES, ROLE_HOME, type Role } from "@/constants/roles";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

// Blunt, IP-based baseline covering every API route (including /api/auth). Individual routes
// (login, register, exports) additionally enforce their own tighter, more specific limits —
// this is just a safety net against a single IP hammering *any* endpoint, whether from a bug
// (e.g. a runaway client-side effect) or deliberate abuse.
const API_BASELINE_LIMIT = 300;
const API_BASELINE_WINDOW_MS = 60 * 1000;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Next.js 16 network boundary (replaces middleware.ts).
 * Runs before any route handler / page render:
 *  1. Rate-limits all /api/* traffic by IP (baseline safety net).
 *  2. Redirects unauthenticated users away from protected routes.
 *  3. Enforces RBAC: a role can only reach routes under its allowed prefixes.
 *  4. Redirects authenticated users away from /login to their role's home.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    const ip = getClientIp(request);
    const { allowed } = checkRateLimit(`api:${ip}`, API_BASELINE_LIMIT, API_BASELINE_WINDOW_MS);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak permintaan. Silakan coba lagi sebentar lagi." },
        { status: 429 },
      );
    }
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = await auth();
  const user = session?.user;

  if (isPublicPath(pathname)) {
    if (user && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL(ROLE_HOME[user.role], request.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/dashboard")) {
    const allowedPrefixes = ROLE_ALLOWED_PREFIXES[user.role as Role];
    const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (!isAllowed) {
      return NextResponse.redirect(new URL(ROLE_HOME[user.role as Role], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
