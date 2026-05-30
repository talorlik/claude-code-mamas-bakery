import { getTranslations, setRequestLocale } from "next-intl/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { listCustomers } from "@/lib/users/customer-queries"
import { CustomersManager } from "./customers-manager"

/**
 * Admin customer management page. Guarded by requireAdmin; lists every
 * registered account and lets the admin send a password-reset email. The
 * current admin's id is passed through so the manager can hide the reset action
 * on the admin's own row.
 */
export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const currentAdminId = await requireAdmin()
  const t = await getTranslations("adminCustomers")

  const customers = await listCustomers()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("heading")}</h2>
      <CustomersManager customers={customers} currentAdminId={currentAdminId} />
    </div>
  )
}
