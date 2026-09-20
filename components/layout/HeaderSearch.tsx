"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories, tools, type Tool } from "@/lib/tools";

function categoryLabel(id: Tool["category"]) {
  if (id === "color") return "Color";
  return categories.find((category) => category.id === id)?.label ?? id;
}

function matchTools(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return tools
    .map((tool) => {
      const name = tool.name.toLowerCase();
      const slug = tool.slug.replace(/-/g, " ");
      const desc = tool.description.toLowerCase();
      const cat = categoryLabel(tool.category).toLowerCase();
      let score = 0;
      if (name === q || slug === q) score = 100;
      else if (name.startsWith(q) || slug.startsWith(q)) score = 90;
      else if (name.includes(q) || slug.includes(q)) score = 70;
      else if (cat.startsWith(q) || cat.includes(q)) score = 40;
      else if (desc.includes(q)) score = 20;
      return { tool, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, 8)
    .map((item) => item.tool);
}

export function HeaderSearch({
  className = "",
  onSelect,
}: {
  className?: string;
  onSelect?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => matchTools(query), [query]);
  const showList = open && query.trim().length > 0;

  useEffect(() => {
    setQuery("");
    setOpen(false);
    setActive(0);
  }, [pathname]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(tool: Tool) {
    setQuery("");
    setOpen(false);
    onSelect?.();
    router.push(`/tools/${tool.slug}`);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <label className="relative block">
        <span className="sr-only">Search tools</span>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-text-dim pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
        >
          <circle cx="7" cy="7" r="4.25" />
          <path d="M10.5 10.5 13.5 13.5" />
        </svg>
        <input
          type="search"
          value={query}
          autoComplete="off"
          spellCheck={false}
          placeholder="Search tools"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls="header-tool-suggestions"
          className="border-line bg-bg text-text placeholder:text-text-dim w-full rounded-[3px] border py-2 pr-3 pl-8 font-mono text-[13px] outline-none focus:border-amber"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }
            if (!showList || results.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((value) => (value + 1) % results.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((value) => (value - 1 + results.length) % results.length);
            } else if (event.key === "Enter") {
              event.preventDefault();
              const tool = results[active] ?? results[0];
              if (tool) go(tool);
            }
          }}
        />
      </label>

      {showList ? (
        <div
          id="header-tool-suggestions"
          role="listbox"
          className="border-line bg-surface absolute top-[calc(100%+6px)] right-0 left-0 z-50 overflow-hidden rounded-[8px] border shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          {results.length === 0 ? (
            <div className="text-text-dim px-3 py-3 font-mono text-[12px]">
              No matching tools
            </div>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto py-1">
              {results.map((tool, index) => (
                <li key={tool.slug}>
                  <Link
                    role="option"
                    aria-selected={index === active}
                    href={`/tools/${tool.slug}`}
                    className={`flex items-center gap-3 px-3 py-2 ${
                      index === active ? "bg-surface-2" : "hover:bg-surface-2"
                    }`}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => {
                      setQuery("");
                      setOpen(false);
                      onSelect?.();
                    }}
                  >
                    <span className="border-amber-dim text-amber flex size-7 shrink-0 items-center justify-center rounded-[4px] border font-mono text-[11px]">
                      {tool.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="font-display block truncate text-[14px] font-semibold">
                        {tool.name}
                      </span>
                      <span className="text-text-dim mt-0.5 block font-mono text-[11px] tracking-[0.06em] uppercase">
                        {categoryLabel(tool.category)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
