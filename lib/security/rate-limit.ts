/**
 * In-Memory Sliding Window Rate Limiter for Next.js App Router API Routes.
 * Designed for serverless/edge/node execution with zero external dependencies.
 * Provides granular IP / User-based rate limiting with standard Retry-After headers.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup stale keys every 5 minutes to avoid memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function purgeStaleKeys(now: number, windowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, record] of memoryStore.entries()) {
    const valid = record.timestamps.filter((ts) => now - ts < windowMs);
    if (valid.length === 0) {
      memoryStore.delete(key);
    } else {
      record.timestamps = valid;
    }
  }
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Duration of the sliding window in milliseconds (default: 60,000ms = 1 min) */
  windowMs?: number;
  /** Custom key prefix for separating distinct endpoints */
  prefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSeconds: number;
}

/**
 * Checks whether a given identifier (userId, IP, or token) is rate limited.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000;
  const limit = options.limit;
  const prefix = options.prefix ?? "default";
  const now = Date.now();

  purgeStaleKeys(now, windowMs);

  const key = `${prefix}:${identifier}`;
  let record = memoryStore.get(key);

  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Filter timestamps within current window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);
  record.timestamps = validTimestamps;

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    const retryAfterSeconds = Math.ceil(resetMs / 1000);
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetMs,
      retryAfterSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const oldest = record.timestamps[0];
  const resetMs = Math.max(0, windowMs - (now - oldest));

  return {
    allowed: true,
    limit,
    remaining,
    resetMs,
    retryAfterSeconds: 0,
  };
}

async function getSupabaseSafe() {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

/**
 * Distributed Rate Limiting for Multi-Instance Serverless Fleets.
 * Evaluates Layer 1 (in-memory) then coordinates with Layer 2 (Supabase) if available.
 */
export async function checkSharedRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  // 1. Layer 1: Fast in-memory burst protection
  const localResult = checkRateLimit(identifier, options);
  if (!localResult.allowed) {
    return localResult;
  }

  // 2. Layer 2: Distributed multi-instance ledger via Supabase if configured
  try {
    const db = await getSupabaseSafe();
    if (!db) {
      return localResult;
    }

    const windowMs = options.windowMs ?? 60_000;
    const limit = options.limit;
    const prefix = options.prefix ?? "default";
    const key = `${prefix}:${identifier}`;
    const expiresAtIso = new Date(Date.now() + windowMs).toISOString();

    const { data, error } = await db
      .from("api_rate_limits")
      .select("request_count, window_expires_at")
      .eq("key", key)
      .maybeSingle();

    if (!error && data) {
      const isExpired = new Date(data.window_expires_at).getTime() < Date.now();
      if (!isExpired) {
        if (data.request_count >= limit) {
          const resetMs = Math.max(0, new Date(data.window_expires_at).getTime() - Date.now());
          return {
            allowed: false,
            limit,
            remaining: 0,
            resetMs,
            retryAfterSeconds: Math.ceil(resetMs / 1000),
          };
        }
        await db
          .from("api_rate_limits")
          .update({ request_count: data.request_count + 1 })
          .eq("key", key);

        return {
          allowed: true,
          limit,
          remaining: Math.max(0, limit - (data.request_count + 1)),
          resetMs: Math.max(0, new Date(data.window_expires_at).getTime() - Date.now()),
          retryAfterSeconds: 0,
        };
      }
    }

    await db.from("api_rate_limits").upsert({
      key,
      request_count: 1,
      window_expires_at: expiresAtIso,
    });
  } catch {
    // If Supabase is unconfigured or table is pending, gracefully fallback to local in-memory decision
  }

  return localResult;
}

/**
 * Helper to extract client identifier from Request headers (Clerk user ID or IP).
 */
export function getClientIdentifier(req: Request, fallbackId?: string | null): string {
  if (fallbackId && fallbackId.trim()) {
    return fallbackId.trim();
  }
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return ip;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }
  return "anonymous-client";
}

