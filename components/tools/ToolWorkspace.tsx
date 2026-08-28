import type { ReactNode } from "react";
import { ToolCard } from "@/components/tools/ToolCard";
import type { Tool } from "@/lib/tools";

export function ToolWorkspace({
  icon,
  name,
  description,
  children,
}: {
  icon: string;
  name: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="border-line bg-surface overflow-hidden rounded-[8px] border">
      <div className="border-line flex items-start gap-4 border-b px-[22px] py-[26px]">
        <div className="border-amber-dim text-amber flex size-8 shrink-0 items-center justify-center rounded-[4px] border font-mono text-[13px]">
          {icon}
        </div>
        <div>
          <h1 className="font-display text-[26px] font-semibold">{name}</h1>
          <p className="text-text-dim mt-1 text-[15px] leading-[1.5]">
            {description}
          </p>
        </div>
      </div>
      <div className="px-[22px] py-[26px]">{children}</div>
    </div>
  );
}

export function RelatedTools({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;
  return (
    <div className="mt-[70px]">
      <div className="font-display mb-9 text-[32px] font-semibold">
        Related tools
      </div>
      <div
        className={`bg-line border-line grid gap-px overflow-hidden rounded-[8px] border max-[800px]:grid-cols-2 ${
          tools.length <= 2 ? "grid-cols-2" : "grid-cols-4"
        }`}
      >
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
