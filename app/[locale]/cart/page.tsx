import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"
import type { OrderFormDefaults } from "@/components/cart/order-form"
import { CartView } from "./cart-view"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "cart" })
  return { title: t("title"), robots: { index: false, follow: false } }
}

/**
 * Cart page. The interactive body is a client component reading the cart
 * context; this server page only sets metadata and the heading.
 */
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Ordering requires an account: resolve the session here and pass auth state
  // plus profile-derived form defaults to the client cart. The cart stays
  // browsable when signed out; only checkout is gated.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let defaults: OrderFormDefaults | undefined
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "full_name, phone, address_line1, address_line2, city, postal_code"
      )
      .eq("user_id", user.id)
      .maybeSingle()

    defaults = {
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      email: user.email ?? "",
      address: profile?.address_line1
        ? {
            addressLine1: profile.address_line1,
            addressLine2: profile.address_line2 ?? "",
            city: profile.city ?? "",
            postalCode: profile.postal_code ?? "",
          }
        : null,
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <CartView isAuthenticated={Boolean(user)} defaults={defaults} />
    </main>
  )
}
