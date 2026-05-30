"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"
import type { Product, ProductInput } from "@/lib/products/product-types"
import { validateProduct } from "@/lib/products/product-validation"

/**
 * Revalidates the pages affected by a product change: the admin list and the
 * public menu.
 */
function revalidateProductPages() {
  revalidatePath("/admin/products")
  revalidatePath("/menu")
}

/**
 * Creates a product. Admin-guarded and validated server-side; RLS on the
 * products table is the second layer. Returns the created row.
 */
export async function createProduct(
  input: ProductInput
): Promise<ActionResult<Product>> {
  await requireAdmin()
  const validation = validateProduct(input)
  if (!validation.ok) return validation

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .insert(validation.data)
    .select()
    .single()

  if (error || !data) return fail("Could not create the product.")

  revalidateProductPages()
  return ok(data)
}

/**
 * Updates an existing product by id. Admin-guarded and validated.
 */
export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult<Product>> {
  await requireAdmin()
  const validation = validateProduct(input)
  if (!validation.ok) return validation

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .update(validation.data)
    .eq("id", id)
    .select()
    .single()

  if (error || !data) return fail("Could not update the product.")

  revalidateProductPages()
  return ok(data)
}

/**
 * Deletes a product by id. Existing order items keep their name/price
 * snapshots, so historical orders are unaffected.
 */
export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) return fail("Could not delete the product.")

  revalidateProductPages()
  return ok(null)
}

/**
 * Toggles a product's availability without otherwise editing it. Drives the
 * "mark available/unavailable" control.
 */
export async function setProductAvailability(
  id: string,
  isAvailable: boolean
): Promise<ActionResult<Product>> {
  await requireAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", id)
    .select()
    .single()

  if (error || !data) return fail("Could not update availability.")

  revalidateProductPages()
  return ok(data)
}
