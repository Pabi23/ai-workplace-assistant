import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, FileText, ListChecks, Search, MessageSquare, ArrowRight, Clock } from "lucide-react";
import { listGenerations } from "@/lib/ai-tools.functions";
import { Disclaimer } from "@/components/disclaimer";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Dashboard — Workpilot" }] }),
  component: Dashboard,
});

const TOOLS = [
  { to: "/email", title: "Smart Email Generator", desc: "Draft polished emails from a few inputs.", icon: Mail },
  { to: "/meetings", title: "Meeting Notes Summarizer", desc: "Turn raw notes into decisions and action items.", icon: FileText },
  { to: "/tasks", title: "AI Task Planner", desc: "Break any goal into a prioritized task list.", icon: ListChecks },
  { to: "/research", title: "AI Research Assistant", desc: "Get structured briefings on any topic.", icon: Search },
  { to: "/chat", title: "AI Chatbot", desc: "Conversational assistant for anything work-related.", icon: MessageSquare },
] as const;

const TOOL_LABEL: Record<string, string> = {
  email: "Email", meeting: "Meeting", tasks: "Plan", research: "Research",
};

function Dashboard() {
  const { data: recent } = useQuery({
    queryKey: ["generations", "recent"],
    queryFn: () => listGenerations({ data: { limit: 6 } }),
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Good to see you</h1>
        <p className="mt-1.5 text-muted-foreground">
          Pick a tool to get started, or jump back into something you generated recently.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <div className="mb-3 grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
              <t.icon className="size-4.5" />
            </div>
            <h3 className="font-medium">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Open <ArrowRight className="size-3.5" />
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recent activity</h2>
        {recent && recent.length > 0 ? (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {TOOL_LABEL[r.tool] ?? r.tool}
                </span>
                <span className="min-w-0 flex-1 truncate">{r.title}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
            Your generated emails, summaries, plans, and research will appear here.
          </div>
        )}
      </section>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}
