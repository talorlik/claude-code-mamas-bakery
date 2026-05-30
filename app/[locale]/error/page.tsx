import { Link } from "@/i18n/navigation"

import { buttonVariants } from "@/components/ui/button"

export default function ErrorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Your authentication link may be expired or already used. Try signing in
        again or request a new confirmation email.
      </p>
      <Link href="/login" className={buttonVariants()}>
        Back to sign in
      </Link>
    </div>
  )
}
