// Supabase Edge Function: send-order-email
//
// Sends a pre-rendered transactional email over SMTP. The app renders the
// subject/HTML/text (see lib/email/templates) and posts them here; this function
// only transmits, using the same SMTP account configured for Supabase Auth.
//
// SMTP credentials are read from Edge Function secrets (set with
// `supabase secrets set`), never hard-coded:
//   SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM
//
// Deploy: supabase functions deploy send-order-email
// Invoked server-side via the service-role client (verify_jwt is disabled so the
// trusted backend can call it without a user JWT).

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

interface Payload {
  to: string
  subject: string
  html: string
  text: string
}

function required(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required secret: ${name}`)
  return value
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  let payload: Payload
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  if (!payload.to || !payload.subject || !(payload.html || payload.text)) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  try {
    const client = new SMTPClient({
      connection: {
        hostname: required("SMTP_HOST"),
        port: Number(required("SMTP_PORT")),
        tls: true,
        auth: {
          username: required("SMTP_USERNAME"),
          password: required("SMTP_PASSWORD"),
        },
      },
    })

    await client.send({
      from: required("SMTP_FROM"),
      to: payload.to,
      subject: payload.subject,
      content: payload.text,
      html: payload.html,
    })
    await client.close()

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    })
  } catch (err) {
    console.error("send-order-email error:", err)
    return new Response(JSON.stringify({ error: "Send failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
})
