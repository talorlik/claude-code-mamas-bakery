import { headers } from "next/headers"

/**
 * Resolves the absolute origin to embed in links sent by email (confirmation,
 * recovery). Prefers the explicitly configured site URL; otherwise derives it
 * from the request host, downgrading localhost to http so local development
 * links are clickable.
 */
export async function resolveOrigin(): Promise<string> {
  const h = await headers()
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${h.get("host") ?? "localhost:3000"}`.replace(
      /^https:\/\/localhost/,
      "http://localhost"
    )
  )
}
