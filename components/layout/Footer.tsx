import Link from "next/link";
import { SocialIcon } from "@/components/icons/social-icons";
import { footerLinks } from "@/lib/nav";
import type { SocialLinks } from "@/lib/cms-types";

const socialOrder: (keyof SocialLinks)[] = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "pinterest",
  "github",
  "threads",
  "discord",
];

export function Footer({ social }: { social: SocialLinks }) {
  const networks = socialOrder.filter((key) => social[key]);

  return (
    <footer className="border-line text-text-dim fixed inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-4 border-t bg-[rgba(20,23,28,0.92)] px-12 py-4 text-[14px] backdrop-blur-[6px] max-[800px]:gap-1.5 max-[800px]:px-5 max-[800px]:py-1.5 max-[800px]:text-[11px]">
      <div>© 2026 SmartToolX. All calculations for informational use only.</div>
      <div className="flex flex-wrap items-center gap-6 max-[800px]:gap-3">
        {networks.length > 0 ? (
          <div className="flex items-center gap-3 max-[800px]:gap-2">
            {networks.map((key) => (
              <a
                key={key}
                href={social[key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="hover:text-text"
              >
                <SocialIcon name={key} className="size-4 max-[800px]:size-3" />
              </a>
            ))}
          </div>
        ) : null}
        <div className="flex gap-6 max-[800px]:gap-3">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-text">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
