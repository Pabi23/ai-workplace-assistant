import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { getGatewayModel } from "@/lib/ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";

const SYSTEM_PROMPT = `You are a professional AI productivity assistant inside an internal workplace tool.
- Be concise, clear, and helpful.
- Use Markdown for structure (lists, bold, code blocks).
- When the user requests work artifacts (emails, plans, notes, summaries), produce them directly.
- Acknowledge uncertainty and never fabricate facts, citations, or numbers.`;

type ChatBody = { messages: UIMessage[]; threadId?: string };

function makeUserClient(token: string) {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabase = makeUserClient(token);
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const { messages, threadId } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("Missing messages or threadId", { status: 400 });
        }

        // Verify thread belongs to user
        const { data: thread } = await supabase
          .from("chat_threads")
          .select("id,title")
          .eq("id", threadId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        // Persist the latest user message
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          await supabase.from("chat_messages").insert({
            thread_id: threadId,
            user_id: userId,
            role: "user",
            parts: lastUser.parts as never,
          });
        }


        // Auto-title from first user message
        const userMsgCount = messages.filter((m) => m.role === "user").length;
        if (userMsgCount === 1 && thread.title === "New chat" && lastUser) {
          const text = lastUser.parts
            .map((p) => (p.type === "text" ? (p as { text: string }).text : ""))
            .join(" ")
            .trim()
            .slice(0, 60);
          if (text) {
            await supabase.from("chat_threads").update({ title: text }).eq("id", threadId);
          }
        }

        const result = streamText({
          model: getGatewayModel(),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ responseMessage }) => {
            await supabase.from("chat_messages").insert({
              thread_id: threadId,
              user_id: userId,
              role: "assistant",
              parts: responseMessage.parts as never,
            });
            await supabase
              .from("chat_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });
      },
    },
  },
});
