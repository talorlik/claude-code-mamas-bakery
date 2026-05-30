import type { Locale } from "@/lib/email/templates/types"

/** Brand palette for the email shell, matching the bakery's warm theme. */
const BRAND = {
  bg: "#faf6f0",
  card: "#ffffff",
  accent: "#b45309", // warm amber, the bakery accent
  text: "#1f2937",
  muted: "#6b7280",
  border: "#e7ddd0",
}

/**
 * Escapes a string for safe interpolation into HTML email bodies. Customer and
 * product names are user-controlled, so every interpolated value is escaped.
 */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Wraps body HTML in the branded, responsive, RTL-aware email shell. Hebrew
 * renders right-to-left. The markup uses inline styles and tables-free divs
 * that survive common email clients.
 */
export function renderShell({
  locale,
  heading,
  body,
}: {
  locale: Locale
  heading: string
  body: string
}): string {
  // Normalize to a known locale before interpolating into the markup, so the
  // lang attribute can never carry an unexpected value even if a bad locale is
  // somehow passed.
  const lang = locale === "he" ? "he" : "en"
  const dir = lang === "he" ? "rtl" : "ltr"
  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};">
    <div style="max-width:560px;margin:0 auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};direction:${dir};text-align:${dir === "rtl" ? "right" : "left"};">
      <div style="text-align:center;padding:8px 0 16px;">
        <span style="font-size:20px;font-weight:700;color:${BRAND.accent};">Mom's Bakery</span>
      </div>
      <div style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:12px;padding:24px;">
        <h1 style="margin:0 0 12px;font-size:18px;color:${BRAND.text};">${esc(heading)}</h1>
        ${body}
      </div>
      <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};text-align:center;">
        Mom's Bakery
      </p>
    </div>
  </body>
</html>`
}

export { BRAND }
