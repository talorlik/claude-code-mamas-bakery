/**
 * Demo delivery carriers.
 *
 * This is a stub: choosing a carrier records the choice and a flat fee on the
 * order, but no real dispatch, label, or tracking integration happens. The list
 * is the single source of truth for the checkout carrier selector and for the
 * server-side fee lookup (the client-sent fee is never trusted; createOrder
 * re-derives it from getCarrier).
 */

import type { Database } from "@/lib/supabase/database.types"

export type FulfillmentMethod =
  Database["public"]["Enums"]["fulfillment_method"]

export interface DeliveryCarrier {
  /** Stable id stored on the order's delivery_carrier column. */
  id: string
  /** Display name shown in the checkout selector and admin detail. */
  name: string
  /** Flat delivery fee in the store currency, added to the order total. */
  flatFee: number
  /** Human-readable delivery window, e.g. "1-2 business days". */
  etaLabel: string
}

/** The available demo carriers, in display order. */
export const DELIVERY_CARRIERS: readonly DeliveryCarrier[] = [
  { id: "speedy-demo", name: "Speedy Demo", flatFee: 25, etaLabel: "Same day" },
  {
    id: "citywide-demo",
    name: "CityWide Demo",
    flatFee: 15,
    etaLabel: "1-2 business days",
  },
  {
    id: "econo-demo",
    name: "Econo Demo",
    flatFee: 8,
    etaLabel: "3-5 business days",
  },
] as const

/** Looks up a carrier by id, or returns null when the id is unknown. */
export function getCarrier(
  id: string | null | undefined
): DeliveryCarrier | null {
  if (!id) return null
  return DELIVERY_CARRIERS.find((c) => c.id === id) ?? null
}
