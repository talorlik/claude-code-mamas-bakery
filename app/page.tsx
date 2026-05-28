import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <header className="container mx-auto flex w-full max-w-5xl items-center justify-between p-6">
        <div className="flex items-center gap-2 font-mono text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          mamas-bakery
        </div>
        <ThemeToggle />
      </header>

      <main className="container mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <Badge variant="secondary" className="rounded-full">
          Powered by Next.js + Supabase
        </Badge>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Welcome to mamas-bakery
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl text-base sm:text-lg">
            A modern fullstack starter wired up with Supabase auth, SSR
            cookies, and shadcn/ui. Sign in to start building.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "lg" })}
              >
                Go to dashboard
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
              <p className="text-muted-foreground text-sm">
                Signed in as {user.email}
              </p>
            </>
          ) : (
            <>
              <Link
                href="/login?tab=signup"
                className={buttonVariants({ size: "lg" })}
              >
                Get started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </main>

      <footer className="text-muted-foreground container mx-auto w-full max-w-5xl px-6 py-6 text-center text-xs">
        Press <kbd className="bg-muted rounded px-1 py-0.5 font-mono">d</kbd>{" "}
        to toggle dark mode.
      </footer>
    </div>
  );
}
