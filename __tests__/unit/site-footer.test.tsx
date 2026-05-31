import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

import { SiteFooter } from "@/components/shared/site-footer"
import enMessages from "@/messages/en.json"

// next-intl's navigation primitives depend on next/navigation which doesn't
// resolve cleanly under jsdom. Stub the locale-aware Link so tests can render
// the footer without a Next.js runtime.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

function renderFooter() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <SiteFooter />
    </NextIntlClientProvider>
  )
}

describe("SiteFooter", () => {
  it("renders the footer tagline and a menu link", () => {
    renderFooter()
    expect(
      screen.getByText("Crafted daily. Presented with precision.")
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Menu" })).toBeInTheDocument()
  })

  it("renders inside a contentinfo landmark", () => {
    renderFooter()
    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
  })
})
