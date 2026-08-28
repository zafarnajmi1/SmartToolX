import { ToolCard } from "@/components/tools/ToolCard";
import type { Tool } from "@/lib/tools";

export function ToolGrid({
  tools,
  tone = "amber",
}: {
  tools: Tool[];
  tone?: "amber" | "steel";
}) {
  const columns =
    tools.length <= 2
      ? "grid-cols-1 min-[801px]:grid-cols-2"
      : "grid-cols-2 min-[801px]:grid-cols-4";
  const fillers =
    tools.length >= 3 ? (4 - (tools.length % 4)) % 4 : 0;

  return (
    <div
      className={`bg-line border-line grid ${columns} gap-px overflow-hidden rounded-[8px] border`}
    >
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} tone={tone} />
      ))}
      {Array.from({ length: fillers }, (_, index) => (
        <div key={`filler-${index}`} className="bg-surface min-h-[150px]" />
      ))}
    </div>
  );
}
