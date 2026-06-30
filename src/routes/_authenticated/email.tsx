import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { ToolWorkbench } from "@/components/tool-workbench";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — Workpilot" }] }),
  component: EmailPage,
});

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("professional");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");

  return (
    <ToolPage
      icon={<Mail className="size-5" />}
      title="Smart Email Generator"
      description="Generate polished, on-tone emails from a few quick inputs."
    >
      <ToolWorkbench
        tool="email"
        ctaLabel="Generate email"
        inputValues={{ recipient, tone, purpose, keyPoints }}
        form={
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Recipient</Label>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Hiring manager, client, team..." />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="apologetic">Apologetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Purpose</Label>
              <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Follow up on Q3 proposal" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Key points to include</Label>
              <Textarea value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} rows={4} placeholder="- Recap deliverables&#10;- Confirm timeline&#10;- Ask for sign-off by Friday" />
            </div>
          </div>
        }
      />
    </ToolPage>
  );
}
