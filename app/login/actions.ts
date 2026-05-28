"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

type Credentials = { email: string; password: string };

// Lightweight validation — keep it simple, the form is HTML-validated too.
// Returns null on bad input; callers redirect with a query-string error.
function readCredentials(formData: FormData): Credentials | null {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return null;
  return { email, password };
}

export async function login(formData: FormData) {
  const creds = readCredentials(formData);
  if (!creds) {
    redirect(
      `/login?error=${encodeURIComponent("Email and password are required.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: creds.email,
    password: creds.password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/chat");
}

export async function signup(formData: FormData) {
  const creds = readCredentials(formData);
  if (!creds) {
    redirect(
      `/login?error=${encodeURIComponent("Email and password are required.")}`,
    );
  }

  // Build the absolute URL that Supabase will embed in the confirmation email.
  // Falls back to the request's own host when NEXT_PUBLIC_SITE_URL isn't set.
  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${h.get("host") ?? "localhost:3000"}`.replace(
      /^https:\/\/localhost/,
      "http://localhost",
    );

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: creds.email,
    password: creds.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // The user must click the link in the email before the session is created.
  redirect(`/login?notice=${encodeURIComponent("Check your email to confirm your account.")}`);
}
