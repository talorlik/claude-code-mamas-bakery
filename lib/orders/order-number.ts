/**
 * Generates a human-readable order number of the form `MB-YYYYMMDD-XXXX`,
 * where `XXXX` is a random base-36 suffix. Uniqueness is enforced by the
 * `orders.order_number` unique constraint; callers retry on conflict.
 *
 * @param now - injectable clock for deterministic testing; defaults to today.
 */
export function generateOrderNumber(now: Date = new Date()): string {
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(now.getUTCDate()).padStart(2, "0")
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `MB-${yyyy}${mm}${dd}-${suffix}`
}
