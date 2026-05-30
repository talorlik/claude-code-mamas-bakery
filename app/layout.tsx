/**
 * Root layout pass-through.
 *
 * The `<html>` and `<body>` elements, fonts, providers, and `lang`/`dir`
 * attributes are owned by `app/[locale]/layout.tsx`, which has access to the
 * resolved locale. This root layout only forwards children so that the
 * non-localized route handlers under `app/api` and `app/auth` still have a
 * valid root.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
