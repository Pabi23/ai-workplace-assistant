import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { ToolWorkbench } from "@/components/tool-workbench";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — Workpilot" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  return (
    <ToolPage
      icon={<FileText className="size-5" />}
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript — get a clean TL;DR, decisions, and action items."
    >
      <ToolWorkbench
        tool="meeting"
        ctaLabel="Summarize"
        inputValues={{ notes }}
        form={
          <div className="space-y-1.5">
            <Label>Notes or transcript</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              placeholder="Paste meeting notes, bullet points, or a transcript here…"
            />
          </div>
        }
      />
    </ToolPage>
  );
}
