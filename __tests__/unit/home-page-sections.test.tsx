import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

import { HeroSection } from "@/components/home/hero-section"
import { SignatureCollection } from "@/components/home/signature-collection"
import { ArtisanPrinciples } from "@/components/home/artisan-principles"
import { SeasonalFeature } from "@/components/home/seasonal-feature"
import { AboutBlurb } from "@/components/home/about-blurb"
import { VisitSection } from "@/components/home/visit-section"
import { CartProvider } from "@/components/cart/cart-provider"
import enMessages from "@/messages/en.json"

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

// next-intl's navigation primitives depend on next/navigation which doesn't
// resolve cleanly under jsdom. Stub locale-aware Link so tests render without
// a Next.js runtime (same pattern as site-footer.test.tsx).
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

describe("home page sections compose without error", () => {
  it("renders hero, signature (empty), principles, seasonal, about, visit", () => {
    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <CartProvider>
          <HeroSection />
          <SignatureCollection products={[]} locale="en" />
          <ArtisanPrinciples />
          <SeasonalFeature />
          <AboutBlurb />
          <VisitSection />
        </CartProvider>
      </NextIntlClientProvider>
    )
    expect(
      screen.getByText("Fresh pastries, crafted every morning.")
    ).toBeInTheDocument()
    expect(screen.getByText("Handmade")).toBeInTheDocument()
    expect(screen.getByText("Strawberry Mille-Feuille")).toBeInTheDocument()
  })
})
