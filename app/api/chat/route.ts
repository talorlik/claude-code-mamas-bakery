import { convertToModelMessages, streamText, type UIMessage } from "ai"

import { createClient } from "@/lib/supabase/server"

// Allow streaming responses up to 30 seconds (Vercel default is 10s).
export const maxDuration = 30

export async function POST(req: Request) {
  // Gate the endpoint on auth so anonymous traffic can't drain the 5$ credit.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  // The string "provider/model" form routes through the AI Gateway automatically
  // when AI_GATEWAY_API_KEY is set in the environment.
  const result = streamText({
    model: "anthropic/claude-sonnet-4.5",
    system:
      "You are a helpful assistant for the mamas-bakery app. Keep answers concise.",
    // AI SDK 6 beta: convertToModelMessages is async.
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
