"use client";

import { useMemo, useState } from "react";
import { CategoryPills } from "@/components/tools/CategoryPills";
import { ToolCard } from "@/components/tools/ToolCard";
import { getRecentHomeTools, type ToolCategory } from "@/lib/tools";

export function MostUsedTools() {
  const [active, setActive] = useState<ToolCategory | "all">("all");
  const listed = useMemo(() => getRecentHomeTools(active), [active]);

  return (
    <section className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-display text-[32px] font-semibold">
            Most used tools
          </div>
          <div className="text-text-dim mt-2 max-w-[420px] text-[16px]">
            Recently added tools. Switch a tab to see the newest in that category.
          </div>
        </div>
        <CategoryPills active={active} onChange={setActive} />
      </div>
      <div className="bg-line border-line grid grid-cols-4 gap-px overflow-hidden rounded-[8px] border max-[800px]:grid-cols-2">
        {listed.map((tool) => (
          <div key={tool.slug} className="h-full">
            <ToolCard tool={tool} />
          </div>
        ))}
        {Array.from(
          { length: listed.length >= 3 ? (4 - (listed.length % 4)) % 4 : 0 },
          (_, index) => (
            <div key={`filler-${index}`} className="bg-surface min-h-[150px]" />
          ),
        )}
      </div>
    </section>
  );
}
