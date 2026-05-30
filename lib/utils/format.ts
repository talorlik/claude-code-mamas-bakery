/**
 * Formats a monetary amount as Israeli new shekels with two decimals,
 * e.g. `18` -> `"₪18.00"`. The currency symbol leads regardless of locale so
 * the value stays readable inside RTL layouts.
 *
 * Applies an epsilon nudge before rounding so half-way values round up
 * consistently (e.g. `18.005` -> `"₪18.01"`) rather than being pulled down by
 * binary floating-point representation.
 */
export function formatPrice(amount: number): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100
  return `₪${rounded.toFixed(2)}`
}

/**
 * Formats a calendar date as `DD/MM/YYYY`.
 *
 * Accepts an ISO date string (`"2026-05-30"`) or a `Date`. Date-only strings
 * and `Date` instances are formatted by their UTC components, so the rendered
 * day never shifts with the host timezone.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const day = String(d.getUTCDate()).padStart(2, "0")
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  const year = d.getUTCFullYear()
  return `${day}/${month}/${year}`
}
