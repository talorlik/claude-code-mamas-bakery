/**
 * Discriminated result type returned by all server actions and route handlers.
 *
 * On success, `data` carries the payload. On failure, `error` is a
 * user-safe message and `fieldErrors` optionally maps form field names to
 * per-field messages. Callers narrow on `ok` to access the correct branch.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

/**
 * Constructs a successful {@link ActionResult}.
 */
export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

/**
 * Constructs a failed {@link ActionResult} with a user-safe message and
 * optional per-field errors.
 */
export function fail<T = never>(
  error: string,
  fieldErrors?: Record<string, string>
): ActionResult<T> {
  return fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error }
}
