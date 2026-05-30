"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import type { Product, ProductInput } from "@/lib/products/product-types"
import { PRODUCT_CATEGORIES } from "@/lib/products/product-types"
import { categoryLabel } from "@/lib/products/product-formatting"
import type { Locale } from "@/lib/orders/order-formatting"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"

/**
 * Create/edit form for a product. Controlled by the caller, which supplies the
 * submit handler (a server action), the busy state, and any field errors.
 * When `product` is provided the form is pre-filled for editing.
 */
export function ProductForm({
  product,
  locale,
  onSubmit,
  onCancel,
  pending,
  fieldErrors,
}: {
  product?: Product
  locale: Locale
  onSubmit: (input: ProductInput) => void
  onCancel?: () => void
  pending: boolean
  fieldErrors?: Record<string, string>
}) {
  const t = useTranslations("adminProducts")
  const [isAvailable, setIsAvailable] = React.useState(
    product?.is_available ?? true
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    onSubmit({
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      price: String(data.get("price") ?? ""),
      category: String(data.get("category") ?? "other"),
      imageUrl: String(data.get("imageUrl") ?? ""),
      isAvailable,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={product?.name ?? ""}
          required
          minLength={2}
        />
        {fieldErrors?.name ? (
          <p className="text-sm text-destructive">{fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          rows={2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="price">{t("price")}</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? ""}
            required
          />
          {fieldErrors?.price ? (
            <p className="text-sm text-destructive">{fieldErrors.price}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">{t("category")}</Label>
          <NativeSelect
            id="category"
            name="category"
            defaultValue={product?.category ?? "other"}
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c, locale)}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="imageUrl">{t("imageUrl")}</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={product?.image_url ?? ""}
          placeholder="https://…"
        />
        {fieldErrors?.imageUrl ? (
          <p className="text-sm text-destructive">{fieldErrors.imageUrl}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isAvailable"
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
        <Label htmlFor="isAvailable">{t("available")}</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={pending}
          >
            {t("cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
