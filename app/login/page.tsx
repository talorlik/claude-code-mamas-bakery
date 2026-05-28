import Link from "next/link";

import { LoginTabs } from "./login-tabs";
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
  searchParams: Promise<{ error?: string; notice?: string; tab?: string }>;
}) {
  const params = await searchParams;
  // Honor ?tab=signup so links from the landing page can land on the right tab.
  const defaultTab = params.tab === "signup" ? "signup" : "signin";

  return (
    <div className="bg-background text-foreground flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome to mamas-bakery</CardTitle>
          <CardDescription>
            Sign in to your account, or create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginTabs
            error={params.error}
            notice={params.notice}
            defaultTab={defaultTab}
          />

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
