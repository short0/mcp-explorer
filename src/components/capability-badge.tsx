import { cn } from "@/lib/utils";
import type { CapabilityKind } from "@/lib/mcp/types";

const STYLES: Record<CapabilityKind, string> = {
  tool: "bg-tool text-tool-foreground",
  resource: "bg-resource text-resource-foreground",
  prompt: "bg-prompt text-prompt-foreground",
};

const LABELS: Record<CapabilityKind, string> = {
  tool: "Tool",
  resource: "Resource",
  prompt: "Prompt",
};

export function CapabilityBadge({ kind, className }: { kind: CapabilityKind; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        STYLES[kind],
        className,
      )}
    >
      {LABELS[kind]}
    </span>
  );
}
