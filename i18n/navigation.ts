import { createNavigation } from "next-intl/navigation"

import { routing } from "@/i18n/routing"

/**
 * Locale-aware navigation primitives. Use these in place of `next/link` and
 * `next/navigation` so locale prefixes are added automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
