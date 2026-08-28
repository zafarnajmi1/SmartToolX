"use client";

import { categories, type ToolCategory } from "@/lib/tools";

export function CategoryPills({
  active,
  onChange,
}: {
  active: ToolCategory | "all";
  onChange: (id: ToolCategory | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const isActive = category.id === active;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={`cursor-pointer rounded-[20px] border px-4 py-[9px] font-mono text-[14px] ${
              isActive
                ? "border-amber text-amber"
                : "border-line text-text-dim"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
