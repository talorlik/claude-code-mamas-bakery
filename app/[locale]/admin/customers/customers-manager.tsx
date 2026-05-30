"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { Customer } from "@/lib/users/customer-types"
import { sendCustomerPasswordReset } from "@/lib/users/customer-admin-actions"
import { formatDate } from "@/lib/utils/format"
import { EmptyState } from "@/components/shared/states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * Admin customer manager: a searchable table of registered accounts with a
 * per-row "send password reset link" action. Filtering is client-side over the
 * server-provided list; the reset action calls the admin-guarded server action
 * and toasts the result. The reset button is hidden on the current admin's own
 * row (they use self-service forgot-password instead).
 */
export function CustomersManager({
  customers,
  currentAdminId,
}: {
  customers: Customer[]
  currentAdminId: string
}) {
  const t = useTranslations("adminCustomers")
  const [search, setSearch] = React.useState("")
  const [pendingId, setPendingId] = React.useState<string | null>(null)

  const query = search.trim().toLowerCase()
  const filtered = query
    ? customers.filter(
        (c) =>
          c.email.toLowerCase().includes(query) ||
          (c.fullName?.toLowerCase().includes(query) ?? false)
      )
    : customers

  async function handleReset(customer: Customer) {
    if (!window.confirm(`${t("resetConfirm")} ${customer.email}`)) return

    setPendingId(customer.id)
    const result = await sendCustomerPasswordReset(customer.email)
    setPendingId(null)

    if (result.ok) {
      toast.success(t("resetSent"))
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-1.5 sm:max-w-xs">
        <Label htmlFor="customer-search">{t("search")}</Label>
        <Input
          id="customer-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("joined")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.email}
                  {customer.isAdmin ? (
                    <Badge variant="secondary" className="ms-2">
                      {t("adminBadge")}
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell>{customer.fullName ?? "—"}</TableCell>
                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                <TableCell className="text-end">
                  {customer.id === currentAdminId ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pendingId === customer.id}
                      onClick={() => handleReset(customer)}
                    >
                      {t("sendReset")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
