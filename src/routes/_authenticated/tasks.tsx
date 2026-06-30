import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { ToolWorkbench } from "@/components/tool-workbench";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "AI Task Planner — Workpilot" }] }),
  component: TasksPage,
});

function TasksPage() {
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [context, setContext] = useState("");

  return (
    <ToolPage
      icon={<ListChecks className="size-5" />}
      title="AI Task Planner"
      description="Turn any goal into a prioritized, sequenced task list with time estimates."
    >
      <ToolWorkbench
        tool="tasks"
        ctaLabel="Build plan"
        inputValues={{ goal, deadline, context }}
        form={
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Goal</Label>
              <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Launch the new pricing page" />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="In 2 weeks / Oct 18" />
            </div>
            <div className="space-y-1.5">
              <Label>Team / resources</Label>
              <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="1 designer, 2 engineers" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Additional context</Label>
              <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={3} placeholder="Constraints, dependencies, definition of done…" />
            </div>
          </div>
        }
      />
    </ToolPage>
  );
}
