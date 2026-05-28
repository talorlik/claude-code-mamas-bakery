import Link from "next/link";

import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="bg-background text-foreground flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to mamas-bakery</CardTitle>
          <CardDescription>
            Enter your email and password to sign in, or create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>

            {params.error ? (
              <p className="text-destructive text-sm">{params.error}</p>
            ) : null}
            {params.notice ? (
              <p className="text-muted-foreground text-sm">{params.notice}</p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Two submit buttons posting to two server actions — Next.js
                  reads `formAction` to route the same form to the right action. */}
              <Button formAction={login} className="flex-1">
                Sign in
              </Button>
              <Button
                formAction={signup}
                variant="outline"
                className="flex-1"
              >
                Sign up
              </Button>
            </div>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            <Link href="/" className="hover:underline">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
