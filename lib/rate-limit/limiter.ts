import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * Production-grade, distributed rate limiting backed by Upstash Redis.
 *
 * Named buckets with per-bucket sliding-window limits guard the sensitive
 * surfaces (auth, order submission, password reset). Keys combine the bucket
 * name with an identifier (usually the client IP) so limits are per-actor.
 *
 * Degrades gracefully: when UPSTASH_REDIS_REST_URL/TOKEN are unset (local dev,
 * tests, preview without secrets), `checkRateLimit` allows every request. The
 * limiter is only active in environments that configure Upstash.
 */

export type RateLimitBucket = "auth" | "order" | "passwordReset"

// Sliding-window limits per bucket: [requests, window].
const BUCKET_CONFIG: Record<
  RateLimitBucket,
  { tokens: number; window: `${number} ${"s" | "m" | "h"}` }
> = {
  auth: { tokens: 10, window: "1 m" },
  order: { tokens: 5, window: "1 m" },
  passwordReset: { tokens: 3, window: "1 h" },
}

function buildRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

const redis = buildRedis()

// Lazily-instantiated limiter per bucket, sharing one Redis connection. Null
// when Upstash is not configured, which signals the no-op path.
const limiters = new Map<RateLimitBucket, Ratelimit>()

function getLimiter(bucket: RateLimitBucket): Ratelimit | null {
  if (!redis) return null
  let limiter = limiters.get(bucket)
  if (!limiter) {
    const cfg = BUCKET_CONFIG[bucket]
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
      prefix: `rl:${bucket}`,
      analytics: false,
    })
    limiters.set(bucket, limiter)
  }
  return limiter
}

export interface RateLimitResult {
  /** True when the request is within the limit (or limiting is disabled). */
  success: boolean
  /** Seconds until the window resets; 0 when allowed or disabled. */
  retryAfter: number
}

/**
 * Checks one request against a bucket for the given identifier (e.g. IP).
 * Returns `{ success: true, retryAfter: 0 }` when limiting is disabled or the
 * request is within the limit; otherwise the seconds to wait before retrying.
 */
export async function checkRateLimit(
  bucket: RateLimitBucket,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(bucket)
  if (!limiter) return { success: true, retryAfter: 0 }

  try {
    const { success, reset } = await limiter.limit(identifier)
    const retryAfter = success
      ? 0
      : Math.max(0, Math.ceil((reset - Date.now()) / 1000))
    return { success, retryAfter }
  } catch {
    // Never let a limiter outage block traffic; fail open.
    return { success: true, retryAfter: 0 }
  }
}

/** Whether distributed rate limiting is configured in this environment. */
export function isRateLimitEnabled(): boolean {
  return redis !== null
}
