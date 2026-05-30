"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"

const BUCKET = "product-images"
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB, mirrors the bucket's file_size_limit
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function revalidateProductPages() {
  revalidatePath("/admin/products")
  revalidatePath("/menu")
}

/**
 * Uploads (or replaces) a product image to Supabase Storage and writes the
 * resulting public URL onto the product row.
 *
 * Admin-guarded server-side; Storage RLS (admin-only writes on the
 * product-images bucket) is the second layer. The object key is derived from
 * the product id so each product has at most one image and re-uploads overwrite
 * it. A cache-busting query param is appended to the stored URL so the menu
 * picks up replacements immediately.
 *
 * The file is passed via FormData (the only way a server action receives a
 * browser File). Returns the updated public URL on success.
 */
export async function uploadProductImage(
  productId: string,
  formData: FormData
): Promise<ActionResult<{ imageUrl: string }>> {
  await requireAdmin()

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return fail("Choose an image file to upload.")
  }
  if (file.size > MAX_BYTES) {
    return fail("Image must be 5 MB or smaller.")
  }
  const ext = ALLOWED[file.type]
  if (!ext) {
    return fail("Image must be a JPEG, PNG, or WebP file.")
  }

  const supabase = await createClient()
  const objectPath = `${productId}.${ext}`

  // Drop any prior image stored under a different extension so a format change
  // (e.g. jpg -> png) does not orphan the old object.
  const stale = Object.values(ALLOWED)
    .filter((e) => e !== ext)
    .map((e) => `${productId}.${e}`)
  if (stale.length > 0) await supabase.storage.from(BUCKET).remove(stale)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, file, { contentType: file.type, upsert: true })
  if (uploadError) return fail("Could not upload the image.")

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  // Cache-bust so a replaced image (same key) is not served stale.
  const imageUrl = `${publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: imageUrl })
    .eq("id", productId)
  if (updateError)
    return fail("Image uploaded but the product was not updated.")

  revalidateProductPages()
  return ok({ imageUrl })
}

/**
 * Removes a product's uploaded image: deletes any matching objects from Storage
 * and clears the image_url. Admin-guarded. Tolerant of a missing object so a
 * product whose image_url is a manual external URL can still be cleared.
 */
export async function removeProductImage(
  productId: string
): Promise<ActionResult<null>> {
  await requireAdmin()

  const supabase = await createClient()
  const keys = Object.values(ALLOWED).map((ext) => `${productId}.${ext}`)
  // Remove every possible extension; absent keys are ignored by Storage.
  await supabase.storage.from(BUCKET).remove(keys)

  const { error } = await supabase
    .from("products")
    .update({ image_url: null })
    .eq("id", productId)
  if (error) return fail("Could not clear the product image.")

  revalidateProductPages()
  return ok(null)
}
