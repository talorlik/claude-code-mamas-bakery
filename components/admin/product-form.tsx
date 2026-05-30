"use client"

import * as React from "react"
import { Croissant, Trash2, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { Product, ProductInput } from "@/lib/products/product-types"
import { PRODUCT_CATEGORIES } from "@/lib/products/product-types"
import { categoryLabel } from "@/lib/products/product-formatting"
import {
  uploadProductImage,
  removeProductImage,
} from "@/lib/products/product-image-actions"
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
  // The current image URL is tracked locally so upload/remove update the preview
  // without closing the dialog. Seeded from the product when editing.
  const [imageUrl, setImageUrl] = React.useState(product?.image_url ?? "")
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (!product) return
    setUploading(true)
    const data = new FormData()
    data.set("file", file)
    const result = await uploadProductImage(product.id, data)
    setUploading(false)
    if (result.ok) {
      setImageUrl(result.data.imageUrl)
      toast.success(t("imageUploaded"))
    } else {
      toast.error(result.error)
    }
  }

  async function handleRemoveImage() {
    if (!product) return
    setUploading(true)
    const result = await removeProductImage(product.id)
    setUploading(false)
    if (result.ok) {
      setImageUrl("")
      toast.success(t("imageRemoved"))
    } else {
      toast.error(result.error)
    }
  }

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
      stockQuantity: String(data.get("stockQuantity") ?? "0"),
      lowStockThreshold: String(data.get("lowStockThreshold") ?? "0"),
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="stockQuantity">{t("stockQuantity")}</Label>
          <Input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock_quantity ?? 0}
            required
          />
          {fieldErrors?.stockQuantity ? (
            <p className="text-sm text-destructive">
              {fieldErrors.stockQuantity}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lowStockThreshold">{t("lowStockThreshold")}</Label>
          <Input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.low_stock_threshold ?? 0}
            required
          />
          {fieldErrors?.lowStockThreshold ? (
            <p className="text-sm text-destructive">
              {fieldErrors.lowStockThreshold}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>{t("image")}</Label>
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            {imageUrl ? (
              // Plain img: the Storage public URL host is not in next.config's
              // remote allowlist, and manual external URLs are arbitrary.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Croissant className="h-6 w-6" aria-hidden />
              </div>
            )}
          </div>

          {product ? (
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file)
                  e.target.value = ""
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="me-1 h-4 w-4" />
                {uploading ? t("uploading") : t("uploadImage")}
              </Button>
              {imageUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="me-1 h-4 w-4" />
                  {t("removeImage")}
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("uploadAfterCreate")}</p>
          )}
        </div>

        <Label htmlFor="imageUrl" className="mt-2 text-xs text-muted-foreground">
          {t("imageUrl")}
        </Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
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
