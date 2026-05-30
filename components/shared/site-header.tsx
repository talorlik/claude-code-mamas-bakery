import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/roles"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/shared/language-switcher"
import { Button, buttonVariants } from "@/components/ui/button"

/**
 * Top navigation shared across all pages. Server-rendered so it can reflect
 * the current auth and admin state: signed-out users see a Sign in link;
 * signed-in users see their account and a sign-out control; admins also see an
 * Admin link. Customer links (Home, Menu, Cart, My Orders) are always shown.
 */
export async function SiteHeader() {
  const t = await getTranslations("nav")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const admin = user ? await isAdmin(user.id) : false

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-semibold">
            {t("home")}
          </Link>
          <Link href="/menu" className="hover:underline">
            {t("menu")}
          </Link>
          <Link href="/cart" className="hover:underline">
            {t("cart")}
          </Link>
          <Link href="/orders" className="hover:underline">
            {t("orders")}
          </Link>
          {admin ? (
            <Link href="/admin" className="hover:underline">
              {t("admin")}
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/profile"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                {t("profile")}
              </Link>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="outline" size="sm">
                  {t("signOut")}
                </Button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
