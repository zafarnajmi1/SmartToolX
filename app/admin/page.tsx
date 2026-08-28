import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCms } from "@/lib/cms";
import { tools } from "@/lib/tools";

const cards = [
  {
    href: "/admin/seo",
    title: "SEO pages",
    body: "Title, description, keywords, canonical, robots, Open Graph, and Twitter fields for every public page.",
  },
  {
    href: "/admin/social",
    title: "Social media",
    body: "Facebook, X, Instagram, LinkedIn, YouTube, and the rest of the public social page.",
  },
  {
    href: "/admin/privacy",
    title: "Privacy policy",
    body: "Edit the public privacy policy content.",
  },
  {
    href: "/admin/terms",
    title: "Terms and conditions",
    body: "Edit the public terms of use.",
  },
];

export default async function AdminDashboardPage() {
  const cms = await getCms();
  const seoCount = Object.keys(cms.seo).length;

  return (
    <AdminShell title="Dashboard">
      <div className="bg-line border-line mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-[8px] border max-[800px]:grid-cols-1">
        <div className="bg-surface p-6">
          <div className="text-steel mb-2 font-mono text-[26px]">{seoCount}</div>
          <div className="text-text-dim text-[12.5px]">Pages with full SEO</div>
        </div>
        <div className="bg-surface p-6">
          <div className="text-steel mb-2 font-mono text-[26px]">
            {tools.length}
          </div>
          <div className="text-text-dim text-[12.5px]">Live tools</div>
        </div>
        <div className="bg-surface p-6">
          <div className="text-steel mb-2 font-mono text-[26px]">
            {Object.values(cms.social).filter(Boolean).length}
          </div>
          <div className="text-text-dim text-[12.5px]">Social profiles</div>
        </div>
      </div>
      <div className="bg-line border-line grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border max-[800px]:grid-cols-1">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-surface hover:bg-surface-2 min-h-[150px] p-6"
          >
            <div className="font-display text-[15px] font-semibold">
              {card.title}
            </div>
            <p className="text-text-dim mt-2 text-[12.5px] leading-[1.5]">
              {card.body}
            </p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
