import { Info } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground ${className}`}>
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <p>
        AI-generated content may be inaccurate. Always review before sharing or acting on it.
      </p>
    </div>
  );
}
