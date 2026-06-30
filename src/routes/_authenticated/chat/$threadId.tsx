import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import { Disclaimer } from "@/components/disclaimer";
import { loadThreadMessages } from "@/lib/chat-threads.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
});

function partsToText(parts: Array<{ type: string; text?: string }>) {
  return parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("");
}

function ChatThread() {
  const { threadId } = Route.useParams();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: initial, isLoading } = useQuery({
    queryKey: ["chat-messages", threadId],
    queryFn: () => loadThreadMessages({ data: { threadId } }),
  });

  const { messages, sendMessage, status, setMessages } = useChat({
    id: threadId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { threadId },
      fetch: async (input, init) => {
        const { data } = await supabase.auth.getSession();
        const headers = new Headers(init?.headers);
        if (data.session?.access_token) headers.set("authorization", `Bearer ${data.session.access_token}`);
        return fetch(input, { ...init, headers });
      },
    }),
  });

  // hydrate initial messages once
  useEffect(() => {
    if (!initial) return;
    setMessages(
      initial.map((m) => ({
        id: m.id,
        role: m.role as UIMessage["role"],
        parts: m.parts as UIMessage["parts"],
      })),
    );
  }, [initial, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  function submit() {
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading conversation…
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
              Ask anything — draft a message, brainstorm, get answers, or work through a problem.
            </div>
          ) : (
            <ul className="space-y-6">
              {messages.map((m) => (
                <li key={m.id} className="flex gap-3">
                  <div
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md",
                      m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
                    )}
                  >
                    {m.role === "user" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      {m.role === "user" ? "You" : "Workpilot"}
                    </div>
                    <Markdown>{partsToText(m.parts as never)}</Markdown>
                  </div>
                </li>
              ))}
              {(status === "submitted" || status === "streaming") &&
                messages[messages.length - 1]?.role === "user" && (
                  <li className="flex gap-3">
                    <div className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="pt-1.5 text-sm text-muted-foreground">
                      <Loader2 className="inline size-3.5 animate-spin" /> Thinking…
                    </div>
                  </li>
                )}
            </ul>
          )}
          <div className="mt-6">
            <Disclaimer />
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-3xl p-3 md:p-4">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Message Workpilot…"
              rows={1}
              className="min-h-0 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button size="icon-sm" onClick={submit} disabled={!input.trim() || status === "streaming"}>
              {status === "streaming" || status === "submitted" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
