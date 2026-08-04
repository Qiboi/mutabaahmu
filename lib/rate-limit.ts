export class TooManyRequestsError extends Error {}

/**
 * Simple in-memory rate limiter (fixed-window counter).
 *
 * Tradeoff: state lives in a module-level Map, so it only holds within a single running
 * server instance. On a serverless platform with multiple concurrent instances, each instance
 * enforces its own limit independently (so the *effective* combined limit can be higher than
 * configured). For a single-school app at this scale that's an acceptable tradeoff — the goal
 * is blunting brute-force/abuse patterns, not perfect distributed accounting. If this app is
 * ever deployed across multiple instances behind a load balancer and stricter guarantees are
 * needed, swap this for a shared store (e.g. Redis / Vercel KV) behind the same `checkRateLimit`
 * signature — no call site would need to change.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so the Map doesn't grow unbounded over a long-running process.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupIfDue() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key Unique identifier for the thing being limited, e.g. `login:${email}` or `ip:${ip}`.
 * @param limit Max requests allowed within the window.
 * @param windowMs Window duration in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  cleanupIfDue();

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Resets a key immediately — used after a successful login to clear failed-attempt counters. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** Best-effort client IP extraction behind common reverse proxies (Vercel, nginx, etc.). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Throws TooManyRequestsError (mapped to HTTP 429 by handleApiError) if the limit is exceeded. */
export function assertRateLimit(key: string, limit: number, windowMs: number): void {
  const { allowed } = checkRateLimit(key, limit, windowMs);
  if (!allowed) {
    throw new TooManyRequestsError("Terlalu banyak permintaan. Silakan coba lagi sebentar lagi.");
  }
}
