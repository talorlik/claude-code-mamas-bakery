import { describe, expect, it } from "vitest"
import { clientIpFromHeaders } from "@/lib/rate-limit/client-ip"

describe("clientIpFromHeaders", () => {
  it("uses the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })
    expect(clientIpFromHeaders(h)).toBe("203.0.113.7")
  })

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "198.51.100.4" })
    expect(clientIpFromHeaders(h)).toBe("198.51.100.4")
  })

  it("returns 'unknown' when no forwarding header is present", () => {
    expect(clientIpFromHeaders(new Headers())).toBe("unknown")
  })
})

describe("checkRateLimit (no Upstash configured)", () => {
  it("allows requests and reports the limiter disabled", async () => {
    // No UPSTASH_REDIS_REST_URL/TOKEN in the test env, so the limiter no-ops.
    const { checkRateLimit, isRateLimitEnabled } = await import(
      "@/lib/rate-limit/limiter"
    )
    expect(isRateLimitEnabled()).toBe(false)
    const result = await checkRateLimit("order", "1.2.3.4")
    expect(result).toEqual({ success: true, retryAfter: 0 })
  })
})
