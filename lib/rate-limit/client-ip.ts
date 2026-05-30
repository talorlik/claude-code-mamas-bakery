/**
 * Extracts the client IP from forwarding headers.
 *
 * Behind Vercel/most proxies the real client IP is the first entry of
 * `x-forwarded-for`; `x-real-ip` is a fallback. Returns "unknown" when no
 * header is present so rate-limit keys stay well-formed (all anonymous callers
 * then share one bucket, which is acceptable for a fail-safe default).
 */
export function clientIpFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim()
    if (first) return first
  }
  return headers.get("x-real-ip")?.trim() || "unknown"
}
