import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"
import type {
  ProductCategory,
  ProductInput,
} from "@/lib/products/product-types"
import { PRODUCT_CATEGORIES } from "@/lib/products/product-types"

/**
 * Normalized, validated product fields ready for a database insert or update.
 */
export interface ValidatedProduct {
  name: string
  description: string
  price: number
  category: ProductCategory
  image_url: string | null
  is_available: boolean
  stock_quantity: number
  low_stock_threshold: number
}

/**
 * Parses a form value to a non-negative integer, returning null when it is not
 * a finite whole number of zero or more.
 */
function parseNonNegativeInt(value: string | number): number | null {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(n) || n < 0) return null
  return n
}

/**
 * Validates whether a string is a parseable, well-formed absolute URL.
 */
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Validates and normalizes product form input per the product validation
 * rules (name length, numeric non-negative price, supported category, optional
 * valid image URL, max description length). Returns the DB-shaped values on
 * success or per-field errors on failure.
 */
export function validateProduct(
  input: ProductInput
): ActionResult<ValidatedProduct> {
  const fieldErrors: Record<string, string> = {}

  const name = input.name.trim()
  if (name.length < 2 || name.length > 120) {
    fieldErrors.name = "Name must be between 2 and 120 characters."
  }

  const description = input.description.trim()
  if (description.length > 500) {
    fieldErrors.description = "Description must be 500 characters or fewer."
  }

  const price =
    typeof input.price === "number" ? input.price : Number(input.price)
  if (!Number.isFinite(price) || price < 0) {
    fieldErrors.price = "Price must be a number of zero or more."
  }

  const category = input.category as ProductCategory
  if (!PRODUCT_CATEGORIES.includes(category)) {
    fieldErrors.category = "Choose a supported category."
  }

  const rawImageUrl = (input.imageUrl ?? "").trim()
  if (rawImageUrl && !isValidUrl(rawImageUrl)) {
    fieldErrors.imageUrl = "Enter a valid image URL or leave it blank."
  }

  const stockQuantity = parseNonNegativeInt(input.stockQuantity)
  if (stockQuantity === null) {
    fieldErrors.stockQuantity = "Stock must be a whole number of zero or more."
  }

  const lowStockThreshold = parseNonNegativeInt(input.lowStockThreshold)
  if (lowStockThreshold === null) {
    fieldErrors.lowStockThreshold =
      "Low-stock threshold must be a whole number of zero or more."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fail("Please correct the highlighted fields.", fieldErrors)
  }

  return ok({
    name,
    description,
    price,
    category,
    image_url: rawImageUrl || null,
    is_available: input.isAvailable,
    stock_quantity: stockQuantity as number,
    low_stock_threshold: lowStockThreshold as number,
  })
}
