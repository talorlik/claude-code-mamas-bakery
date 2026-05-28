import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        Your authentication link may be expired or already used. Try signing
        in again or request a new confirmation email.
      </p>
      <Link href="/login" className={buttonVariants()}>
        Back to sign in
      </Link>
    </div>
  );
}
