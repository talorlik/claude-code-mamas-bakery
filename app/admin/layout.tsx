import type { Metadata } from "next"
import Link from "next/link"

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
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3 border-b pb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/products" className="hover:underline">
            Products
          </Link>
          <Link href="/admin/orders" className="hover:underline">
            Orders
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
