"use client"

import { useTranslations } from "next-intl"

import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type Props = {
  error?: string
  notice?: string
  defaultTab?: "signin" | "signup"
}

export function LoginTabs({ error, notice, defaultTab = "signin" }: Props) {
  const t = useTranslations("auth")

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
        <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
      </TabsList>

      <TabsContent value="signin" className="pt-4">
        <CredentialsForm
          action={login}
          submitLabel={t("signIn")}
          formId="signin"
          autoCompletePassword="current-password"
          error={error}
          notice={notice}
        />
      </TabsContent>

      <TabsContent value="signup" className="pt-4">
        <CredentialsForm
          action={signup}
          submitLabel={t("createAccount")}
          formId="signup"
          autoCompletePassword="new-password"
          error={error}
          notice={notice}
        />
      </TabsContent>
    </Tabs>
  )
}

function CredentialsForm({
  action,
  submitLabel,
  formId,
  autoCompletePassword,
  error,
  notice,
}: {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  formId: string
  autoCompletePassword: "current-password" | "new-password"
  error?: string
  notice?: string
}) {
  const t = useTranslations("auth")

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`email-${formId}`}>{t("email")}</Label>
        <Input
          id={`email-${formId}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`password-${formId}`}>{t("password")}</Label>
        <Input
          id={`password-${formId}`}
          name="password"
          type="password"
          autoComplete={autoCompletePassword}
          required
          minLength={8}
          placeholder={t("passwordHint")}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-sm text-muted-foreground">{notice}</p>
      ) : null}

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
