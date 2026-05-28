"use client";

import * as React from "react";
import { ArrowUp, Bot, User } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [input, setInput] = React.useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message on every render that mutates the list.
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status === "streaming" || status === "submitted") return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  return (
    <div className="bg-background text-foreground flex h-svh flex-col">
      <header className="border-border flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-2 font-mono text-sm font-medium">
          <Bot className="h-4 w-4" />
          mamas-bakery chat
        </div>
        <ThemeToggle />
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-muted-foreground py-16 text-center text-sm">
              Ask anything to get started.
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {error ? (
            <div className="text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
              {error.message ?? "Something went wrong."}
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="border-border border-t px-4 py-4"
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Claude..."
            disabled={status === "streaming" || status === "submitted"}
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            disabled={
              !input.trim() ||
              status === "streaming" ||
              status === "submitted"
            }
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

type ChatMessage = ReturnType<typeof useChat>["messages"][number];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <span key={index} className="whitespace-pre-wrap">
                {part.text}
              </span>
            );
          }
          // Other part types (tool calls, reasoning, etc.) are ignored for now.
          return null;
        })}
      </div>
    </div>
  );
}
