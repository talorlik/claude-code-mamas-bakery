import type { ProductCategory } from "@/lib/products/product-types"
import type { Locale } from "@/lib/orders/order-formatting"

const CATEGORY_LABELS: Record<Locale, Record<ProductCategory, string>> = {
  en: {
    challah: "Challah",
    cake: "Cakes",
    sweets: "Sweets",
    other: "Other",
  },
  he: {
    challah: "חלות",
    cake: "עוגות",
    sweets: "מתוקים",
    other: "אחר",
  },
}

/**
 * Returns the localized label for a product category.
 */
export function categoryLabel(
  category: ProductCategory,
  locale: Locale = "en"
): string {
  return CATEGORY_LABELS[locale][category]
}
