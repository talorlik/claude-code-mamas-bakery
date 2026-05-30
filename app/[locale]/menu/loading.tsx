import { LoadingState } from "@/components/shared/states"

/**
 * Route-level loading UI for the menu while products are fetched.
 */
export default function MenuLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <LoadingState />
    </main>
  )
}
