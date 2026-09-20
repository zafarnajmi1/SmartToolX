"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { SocialLinks } from "@/lib/cms-types";

export function AppShell({
  children,
  social,
}: {
  children: React.ReactNode;
  social: SocialLinks;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return <div className="flex min-h-full flex-col">{children}</div>;
  }
  return (
    <>
      <Header />
      <main className="flex-1 pb-[68px] max-[800px]:pb-[58px]">{children}</main>
      <Footer social={social} />
    </>
  );
}
