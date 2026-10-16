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
      <nav className="flex items-center justify-between gap-2 px-4 py-3.5 sm:gap-3 sm:px-6 lg:px-8 xl:gap-4 xl:px-12 xl:py-[22px]">
        <Logo className="shrink-0 text-[20px] sm:text-[21px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px]" />

        <div className="text-text-dim hidden min-w-0 items-center gap-2.5 text-[12px] lg:flex xl:gap-4 xl:text-[14px] 2xl:gap-8 2xl:text-[16px]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap hover:text-text 2xl:gap-[7px] ${
                pathname === link.href ? "text-text" : ""
              }`}
            >
              <NavIcon name={link.icon} className="size-3.5 shrink-0 2xl:size-[15px]" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <HeaderSearch className="hidden w-[148px] lg:block xl:w-[180px] 2xl:w-[220px]" />
          <Button
            href="/tools"
            variant="cta"
            className="shrink-0 whitespace-nowrap !px-4 !py-2 !text-[14px] lg:!px-3 lg:!py-1.5 lg:!text-[13px] 2xl:!px-4 2xl:!py-2 2xl:!text-[14px]"
          >
            All Tools {"->"}
          </Button>
          <button
            type="button"
            className="border-line text-text-dim flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border lg:hidden"
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
        <div className="border-line border-t px-4 py-4 sm:px-6 lg:hidden">
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
                <NavIcon name={link.icon} className="size-4 shrink-0" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
