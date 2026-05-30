import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { requireAdmin } from "@/lib/auth/require-admin"

/**
 * Admin pages must never be indexed.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Server-side guard for the entire /admin subtree. `requireAdmin()` redirects
 * unauthenticated users to login and non-admins to home, so any content
 * rendered below is admin-only.
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  await requireAdmin()
  const t = await getTranslations("admin")

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3 border-b pb-4">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="hover:underline">
            {t("dashboard")}
          </Link>
          <Link href="/admin/products" className="hover:underline">
            {t("products")}
          </Link>
          <Link href="/admin/orders" className="hover:underline">
            {t("orders")}
          </Link>
          <Link href="/admin/customers" className="hover:underline">
            {t("customers")}
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
