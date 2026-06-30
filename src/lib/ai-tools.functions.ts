import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getGatewayModel } from "./ai-gateway.server";

const ToolEnum = z.enum(["email", "meeting", "tasks", "research"]);

const SYSTEM = {
  email:
    "You are an expert workplace communication assistant. Write a polished, ready-to-send email. Use Markdown. Begin with `Subject:` on the first line, then a blank line, then the email body. Keep it concise, on-brand for the requested tone, and free of placeholders unless the user asked for them.",
  meeting:
    "You are an expert meeting summarizer. Given raw notes or a transcript, produce a Markdown summary with these sections: `## TL;DR`, `## Key Decisions`, `## Action Items` (list with **owner** and due date when present), `## Open Questions / Follow-ups`. Be faithful to the source — do not invent facts.",
  tasks:
    "You are an AI task planner. Break the user's goal into a concrete, sequenced plan as a Markdown checklist. Each task: `- [ ] **Task** — priority (P1/P2/P3), est. time, brief note`. Group by phase using `##` headings when useful. End with a short `## Risks` section.",
  research:
    "You are a meticulous AI research assistant. Produce a structured Markdown briefing: `## Summary`, `## Key Findings` (bulleted), `## Considerations & Trade-offs`, `## Suggested Next Steps`. Be objective; note uncertainty explicitly. Do not fabricate citations.",
} as const;

function buildPrompt(tool: z.infer<typeof ToolEnum>, input: Record<string, unknown>) {
  switch (tool) {
    case "email":
      return `Recipient: ${input.recipient}\nTone: ${input.tone}\nPurpose: ${input.purpose}\nKey points:\n${input.keyPoints}`;
    case "meeting":
      return `Meeting notes / transcript:\n\n${input.notes}`;
    case "tasks":
      return `Goal: ${input.goal}\nDeadline: ${input.deadline || "not specified"}\nContext: ${input.context || "none"}`;
    case "research":
      return `Topic: ${input.topic}\nDepth: ${input.depth}\nFocus questions: ${input.questions || "none"}`;
  }
}

function buildTitle(tool: z.infer<typeof ToolEnum>, input: Record<string, unknown>): string {
  const t = (s: unknown, n = 60) => String(s ?? "").slice(0, n);
  switch (tool) {
    case "email": return `Email: ${t(input.purpose)}`;
    case "meeting": return `Meeting summary — ${new Date().toLocaleDateString()}`;
    case "tasks": return `Plan: ${t(input.goal)}`;
    case "research": return `Research: ${t(input.topic)}`;
  }
}

const RunSchema = z.object({
  tool: ToolEnum,
  input: z.record(z.string(), z.any()),
});

export const runTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RunSchema.parse(d))
  .handler(async ({ data, context }) => {
    const model = getGatewayModel();
    const { text } = await generateText({
      model,
      system: SYSTEM[data.tool],
      prompt: buildPrompt(data.tool, data.input),
    });

    const title = buildTitle(data.tool, data.input);
    const { data: row, error } = await context.supabase
      .from("generations")
      .insert({
        user_id: context.userId,
        tool: data.tool,
        title,
        input: data.input,
        output: text,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ tool: ToolEnum.optional(), limit: z.number().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("generations")
      .select("id,tool,title,created_at,output")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (data.tool) q = q.eq("tool", data.tool);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const updateGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), output: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generations")
      .update({ output: data.output })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("generations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
