"use client"

import * as React from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { Product, ProductInput } from "@/lib/products/product-types"
import { isLowStock } from "@/lib/products/product-types"
import {
  createProduct,
  updateProduct,
  deleteProduct,
  setProductAvailability,
} from "@/lib/products/product-actions"
import { categoryLabel } from "@/lib/products/product-formatting"
import type { Locale } from "@/lib/orders/order-formatting"
import { formatPrice } from "@/lib/utils/format"
import { ProductForm } from "@/components/admin/product-form"
import { EmptyState } from "@/components/shared/states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * Admin product manager: a table of all products with availability toggle,
 * edit, and delete, plus a create dialog. Mutations call the admin-guarded
 * server actions; the route revalidates so the list refreshes with fresh data.
 */
export function ProductsManager({
  products,
  locale,
}: {
  products: Product[]
  locale: Locale
}) {
  const t = useTranslations("adminProducts")
  const [editing, setEditing] = React.useState<Product | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>()

  async function handleCreate(input: ProductInput) {
    setPending(true)
    setFieldErrors(undefined)
    const result = await createProduct(input)
    setPending(false)
    if (result.ok) {
      toast.success(t("saved"))
      setCreating(false)
    } else {
      setFieldErrors(result.fieldErrors)
      if (!result.fieldErrors) toast.error(result.error)
    }
  }

  async function handleUpdate(input: ProductInput) {
    if (!editing) return
    setPending(true)
    setFieldErrors(undefined)
    const result = await updateProduct(editing.id, input)
    setPending(false)
    if (result.ok) {
      toast.success(t("saved"))
      setEditing(null)
    } else {
      setFieldErrors(result.fieldErrors)
      if (!result.fieldErrors) toast.error(result.error)
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(t("deleteConfirm"))) return
    const result = await deleteProduct(product.id)
    if (result.ok) toast.success(t("deleted"))
    else toast.error(result.error)
  }

  async function handleToggle(product: Product, next: boolean) {
    const result = await setProductAvailability(product.id, next)
    if (!result.ok) toast.error(result.error)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="me-1 h-4 w-4" />
                {t("add")}
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("add")}</DialogTitle>
            </DialogHeader>
            <ProductForm
              locale={locale}
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
              pending={pending}
              fieldErrors={fieldErrors}
            />
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              <TableHead>{t("stock")}</TableHead>
              <TableHead>{t("available")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categoryLabel(product.category, locale)}
                  </Badge>
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <span className="tabular-nums">{product.stock_quantity}</span>
                  {isLowStock(product) ? (
                    <Badge variant="destructive" className="ms-2">
                      {t("lowStock")}
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.is_available}
                    onCheckedChange={(next) => handleToggle(product, next)}
                    aria-label={
                      product.is_available
                        ? t("markUnavailable")
                        : t("markAvailable")
                    }
                  />
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("edit")}
                      onClick={() => setEditing(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("delete")}
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit")}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ProductForm
              product={editing}
              locale={locale}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              pending={pending}
              fieldErrors={fieldErrors}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
