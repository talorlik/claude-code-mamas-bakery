"use client";

import * as React from "react";

import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Props = {
  error?: string;
  notice?: string;
  defaultTab?: "signin" | "signup";
};

export function LoginTabs({ error, notice, defaultTab = "signin" }: Props) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign in</TabsTrigger>
        <TabsTrigger value="signup">Sign up</TabsTrigger>
      </TabsList>

      <TabsContent value="signin" className="pt-4">
        <CredentialsForm
          action={login}
          submitLabel="Sign in"
          autoCompletePassword="current-password"
          error={error}
          notice={notice}
        />
      </TabsContent>

      <TabsContent value="signup" className="pt-4">
        <CredentialsForm
          action={signup}
          submitLabel="Create account"
          autoCompletePassword="new-password"
          error={error}
          notice={notice}
        />
      </TabsContent>
    </Tabs>
  );
}

function CredentialsForm({
  action,
  submitLabel,
  autoCompletePassword,
  error,
  notice,
}: {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  autoCompletePassword: "current-password" | "new-password";
  error?: string;
  notice?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`email-${submitLabel}`}>Email</Label>
        <Input
          id={`email-${submitLabel}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`password-${submitLabel}`}>Password</Label>
        <Input
          id={`password-${submitLabel}`}
          name="password"
          type="password"
          autoComplete={autoCompletePassword}
          required
          minLength={6}
          placeholder="At least 6 characters"
        />
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-muted-foreground text-sm">{notice}</p>
      ) : null}

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
