"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/icons/nav-icons";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { navLinks } from "@/lib/nav";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-line sticky top-0 z-20 border-b bg-[rgba(20,23,28,0.85)] backdrop-blur-[6px]">
      <nav className="flex items-center justify-between px-12 py-[22px] max-[800px]:px-5 max-[800px]:py-[18px]">
        <Logo />

        <div className="flex items-center gap-8 text-[16px] text-text-dim max-[800px]:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-[7px] hover:text-text ${
                pathname === link.href ? "text-text" : ""
              }`}
            >
              <NavIcon name={link.icon} className="size-[15px]" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <HeaderSearch className="w-[220px] max-[1100px]:w-[168px] max-[800px]:hidden" />
          <Button href="/tools" variant="cta">
            All Tools {"->"}
          </Button>
          <button
            type="button"
            className="border-line text-text-dim hidden size-9 cursor-pointer items-center justify-center rounded-[3px] border max-[800px]:flex"
            aria-expanded={open}
            aria-label="Open menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="flex flex-col gap-[5px]">
              <span className="bg-text-dim block h-px w-4" />
              <span className="bg-text-dim block h-px w-4" />
              <span className="bg-text-dim block h-px w-4" />
            </span>
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-line hidden border-t px-5 py-4 max-[800px]:block">
          <HeaderSearch className="mb-3 w-full" onSelect={() => setOpen(false)} />
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-[10px] py-2 text-[16px] hover:text-text ${
                  pathname === link.href ? "text-text" : "text-text-dim"
                }`}
                onClick={() => setOpen(false)}
              >
                <NavIcon name={link.icon} className="size-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
