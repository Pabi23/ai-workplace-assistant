import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { ToolWorkbench } from "@/components/tool-workbench";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — Workpilot" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("overview");
  const [questions, setQuestions] = useState("");

  return (
    <ToolPage
      icon={<Search className="size-5" />}
      title="AI Research Assistant"
      description="Generate structured briefings on any topic with findings, trade-offs, and next steps."
    >
      <ToolWorkbench
        tool="research"
        ctaLabel="Research"
        inputValues={{ topic, depth, questions }}
        form={
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="State of vector databases in 2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Quick overview</SelectItem>
                  <SelectItem value="standard">Standard briefing</SelectItem>
                  <SelectItem value="deep-dive">Deep dive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Focus questions (optional)</Label>
              <Textarea value={questions} onChange={(e) => setQuestions(e.target.value)} rows={3} placeholder="- What are the main trade-offs?&#10;- Who are the leading vendors?" />
            </div>
          </div>
        }
      />
    </ToolPage>
  );
}
