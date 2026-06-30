import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createThread, deleteThread, listThreads } from "@/lib/chat-threads.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — Workpilot" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };

  const { data: threads = [] } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: () => listThreads(),
  });

  const create = useMutation({
    mutationFn: () => createThread({ data: {} }),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["chat-threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: row.id } });
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteThread({ data: { id } }),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["chat-threads"] });
      if (params.threadId === id) navigate({ to: "/chat" });
      toast.success("Thread deleted");
    },
  });

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-card/40 md:flex md:flex-col">
        <div className="p-3">
          <Button className="w-full" size="sm" onClick={() => create.mutate()} disabled={create.isPending}>
            <Plus className="size-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {threads.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">No conversations yet.</p>
          ) : (
            <ul className="space-y-0.5">
              {threads.map((t) => {
                const active = params.threadId === t.id;
                return (
                  <li key={t.id} className="group flex items-center gap-1">
                    <Link
                      to="/chat/$threadId"
                      params={{ threadId: t.id }}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-sm",
                        active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                      )}
                    >
                      <MessageSquare className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{t.title}</span>
                    </Link>
                    <button
                      className="rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      onClick={() => del.mutate(t.id)}
                      aria-label="Delete thread"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
