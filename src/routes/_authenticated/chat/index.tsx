import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createThread } from "@/lib/chat-threads.functions";
import { Disclaimer } from "@/components/disclaimer";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const create = useMutation({
    mutationFn: () => createThread({ data: {} }),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["chat-threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: row.id } });
    },
  });

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <MessageSquare className="size-6" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">AI Chatbot</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Have a back-and-forth conversation with your productivity assistant. Threads are saved to your account so you can pick up where you left off.
      </p>
      <Button className="mt-5" onClick={() => create.mutate()} disabled={create.isPending}>
        <Plus className="size-4" /> Start a new chat
      </Button>
      <div className="mt-8 w-full max-w-md">
        <Disclaimer />
      </div>
    </div>
  );
}
