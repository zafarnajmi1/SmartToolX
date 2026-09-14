import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { Logo } from "@/components/layout/Logo";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/seo", label: "SEO pages" },
  { href: "/admin/social", label: "Social media" },
  { href: "/admin/privacy", label: "Privacy policy" },
  { href: "/admin/terms", label: "Terms" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <aside className="border-line bg-surface hidden w-[240px] shrink-0 border-r p-6 md:block">
        <Logo />
        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-dim hover:text-text rounded-[3px] px-3 py-2 text-[14px] hover:bg-surface-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="text-text-dim hover:text-text font-mono text-[12px]"
          >
            Log out
          </button>
        </form>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-line flex items-center justify-between border-b px-6 py-4 md:px-10">
          <h1 className="font-display text-[20px] font-semibold">{title}</h1>
          <div className="flex gap-3 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-dim font-mono text-[11px] uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </header>
        <div className="flex-1 px-6 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}
