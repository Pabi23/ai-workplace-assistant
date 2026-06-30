import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Save, Loader2, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import {
  runTool,
  listGenerations,
  updateGeneration,
  deleteGeneration,
} from "@/lib/ai-tools.functions";
import { toast } from "sonner";

type Tool = "email" | "meeting" | "tasks" | "research";

export function ToolWorkbench({
  tool,
  form,
  inputValues,
  ctaLabel = "Generate",
}: {
  tool: Tool;
  form: ReactNode;
  inputValues: Record<string, unknown>;
  ctaLabel?: string;
}) {
  const qc = useQueryClient();
  const [output, setOutput] = useState<string>("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const { data: history = [] } = useQuery({
    queryKey: ["generations", tool],
    queryFn: () => listGenerations({ data: { tool } }),
  });

  const run = useMutation({
    mutationFn: () => runTool({ data: { tool, input: inputValues } }),
    onSuccess: (row) => {
      setOutput(row.output);
      setCurrentId(row.id);
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["generations"] });
      toast.success("Generated and saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Generation failed"),
  });

  const save = useMutation({
    mutationFn: () => updateGeneration({ data: { id: currentId!, output } }),
    onSuccess: () => {
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["generations"] });
      toast.success("Saved");
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteGeneration({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["generations"] });
      toast.success("Deleted");
    },
  });

  function copyOut() {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Inputs</h2>
          {form}
          <div className="mt-5 flex justify-end">
            <Button onClick={() => run.mutate()} disabled={run.isPending}>
              {run.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> {ctaLabel}
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium text-muted-foreground">Output</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={copyOut} disabled={!output}>
                <Copy className="size-3.5" /> Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => save.mutate()}
                disabled={!currentId || !dirty || save.isPending}
              >
                <Save className="size-3.5" /> Save edits
              </Button>
            </div>
          </header>
          {output ? (
            <div className="grid gap-0 md:grid-cols-2">
              <Textarea
                value={output}
                onChange={(e) => {
                  setOutput(e.target.value);
                  setDirty(true);
                }}
                className="min-h-[360px] resize-none rounded-none border-0 border-b border-border bg-transparent font-mono text-sm focus-visible:ring-0 md:border-b-0 md:border-r"
              />
              <div className="max-h-[480px] overflow-y-auto p-5">
                <Markdown>{output}</Markdown>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Fill in the inputs and hit <span className="font-medium text-foreground">{ctaLabel}</span> to create your draft.
            </div>
          )}
        </section>
      </div>

      <aside className="rounded-xl border border-border bg-card p-3">
        <h2 className="px-2 py-1 text-sm font-medium text-muted-foreground">History</h2>
        {history.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Your saved drafts will appear here.
          </p>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {history.map((h) => (
              <li key={h.id} className="group flex items-center gap-1">
                <button
                  className="min-w-0 flex-1 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    setOutput(h.output);
                    setCurrentId(h.id);
                    setDirty(false);
                  }}
                >
                  <div className="truncate font-medium">{h.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleString()}
                  </div>
                </button>
                <button
                  className="rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  onClick={() => del.mutate(h.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
