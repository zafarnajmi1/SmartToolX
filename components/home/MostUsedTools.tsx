"use client";

import { useMemo, useState } from "react";
import { CategoryPills } from "@/components/tools/CategoryPills";
import { ToolCard } from "@/components/tools/ToolCard";
import { getFeaturedTools, getFileConverterTools, type ToolCategory } from "@/lib/tools";

export function MostUsedTools() {
  const featured = getFeaturedTools();
  const files = getFileConverterTools();
  const [active, setActive] = useState<ToolCategory | "all">("all");
  const listed = active === "files" ? files : featured;
  const visible = useMemo(() => {
    if (active === "files") {
      return new Set(files.map((tool) => tool.slug));
    }
    return new Set(
      active === "all"
        ? featured.map((tool) => tool.slug)
        : featured
            .filter((tool) => tool.category === active)
            .map((tool) => tool.slug),
    );
  }, [active, featured, files]);

  return (
    <section className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-display text-[32px] font-semibold">
            Most used tools
          </div>
          <div className="text-text-dim mt-2 max-w-[420px] text-[16px]">
            The calculators people reach for every day.
          </div>
        </div>
        <CategoryPills active={active} onChange={setActive} />
      </div>
      <div className="bg-line border-line grid grid-cols-4 gap-px overflow-hidden rounded-[8px] border max-[800px]:grid-cols-2">
        {listed.map((tool) => {
          const isVisible = visible.has(tool.slug);
          return (
            <div
              key={tool.slug}
              className={`h-full ${isVisible ? "" : "pointer-events-none opacity-30"}`}
            >
              <ToolCard tool={tool} />
            </div>
          );
        })}
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
