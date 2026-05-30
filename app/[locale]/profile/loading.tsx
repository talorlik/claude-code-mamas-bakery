import { LoadingState } from "@/components/shared/states"

/**
 * Route-level loading UI for the profile page while the account and orders are
 * fetched.
 */
export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <LoadingState />
    </main>
  )
}
