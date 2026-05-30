/**
 * Pickup scheduling rules: the single source of truth for which dates a
 * customer may choose, imported by both the client calendar (to disable dates)
 * and the server validation (to reject them). Keeping one module avoids the
 * classic drift where the UI allows a date the server then rejects.
 *
 * Rules for Mom's Bakery:
 * - Closed Saturday (Shabbat) and Friday. The pickup_date column is date-only,
 *   so "Friday afternoon" cannot be expressed as a time; we block Friday for
 *   pickup entirely rather than pretend to enforce a cutoff we cannot store.
 * - Minimum lead time of 1 day: the earliest selectable date is tomorrow.
 *
 * All comparisons use date-only `YYYY-MM-DD` strings to avoid timezone drift,
 * matching the rest of the order validation.
 */

/** Weekday numbers (0 = Sunday ... 6 = Saturday) the bakery is closed. */
export const CLOSED_WEEKDAYS: readonly number[] = [5, 6] // Friday, Saturday

/** Minimum days between today and the earliest allowed pickup date. */
export const PICKUP_LEAD_DAYS = 1

/** Returns a date as a `YYYY-MM-DD` string in UTC. */
function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Parses a `YYYY-MM-DD` string to a UTC Date at midnight. */
function parseDateString(value: string): Date {
  return new Date(`${value}T00:00:00Z`)
}

/**
 * The earliest allowed pickup date as `YYYY-MM-DD`: today plus the lead time,
 * advanced past any closed weekday so the default is always selectable.
 * `now` is injectable for testing; defaults to the current time.
 */
export function nextAllowedPickupDate(now: Date = new Date()): string {
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  date.setUTCDate(date.getUTCDate() + PICKUP_LEAD_DAYS)
  while (CLOSED_WEEKDAYS.includes(date.getUTCDay())) {
    date.setUTCDate(date.getUTCDate() + 1)
  }
  return toDateString(date)
}

/**
 * Whether a `YYYY-MM-DD` pickup date is allowed: it must be a well-formed date,
 * fall on an open weekday, and be no earlier than the lead-time minimum.
 * `now` is injectable for testing.
 */
export function isPickupDateAllowed(
  value: string,
  now: Date = new Date()
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = parseDateString(value)
  if (Number.isNaN(date.getTime())) return false
  if (CLOSED_WEEKDAYS.includes(date.getUTCDay())) return false
  return value >= nextAllowedPickupDate(now)
}

/**
 * A react-day-picker matcher that returns true for dates that must be disabled
 * (closed weekdays or before the lead-time minimum). Pass to the Calendar's
 * `disabled` prop.
 */
export function pickupDisabledMatcher(date: Date): boolean {
  const value = toDateString(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  )
  return !isPickupDateAllowed(value)
}
