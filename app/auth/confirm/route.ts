import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/confirm
 *
 * Supabase emails embed a URL with `token_hash` and `type` query params.
 * This handler exchanges the token for a session cookie and redirects.
 *
 * Required Supabase email template config: change `{{ .ConfirmationURL }}` to
 *   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
 * in Dashboard → Auth → Email Templates → Confirm signup.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/chat";

  // Build the post-confirm redirect target without leaking the token.
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  // Verification failed (expired, already-used, or missing params).
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}
