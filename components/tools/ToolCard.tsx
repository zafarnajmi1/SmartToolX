import Link from "next/link";
import type { Tool } from "@/lib/tools";

export function ToolCard({
  tool,
  tone = "amber",
}: {
  tool: Tool;
  tone?: "amber" | "steel";
}) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`bg-surface hover:bg-surface-2 flex h-full min-h-[150px] flex-col gap-[14px] px-[22px] py-[26px] duration-150 ${
        tone === "steel"
          ? "transition-[background,transform] hover:-translate-y-[2px]"
          : "transition-colors"
      }`}
    >
      <div
        className={`flex size-8 items-center justify-center rounded-[4px] border font-mono text-[13px] ${
          tone === "steel"
            ? "border-[#2c4a63] text-steel"
            : "border-amber-dim text-amber"
        }`}
      >
        {tool.icon}
      </div>
      <div className="font-display text-[17px] font-semibold">{tool.name}</div>
      <div className="text-text-dim text-[14px] leading-[1.5]">
        {tool.description}
      </div>
    </Link>
  );
}
