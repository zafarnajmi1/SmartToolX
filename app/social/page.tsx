import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCms } from "@/lib/cms";
import type { SocialLinks } from "@/lib/cms-types";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/social");
}

const labels: Record<keyof SocialLinks, string> = {
  facebook: "Facebook",
  twitter: "X / Twitter",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  github: "GitHub",
  threads: "Threads",
  discord: "Discord",
};

export default async function SocialPage() {
  const cms = await getCms();
  const links = (Object.keys(labels) as (keyof SocialLinks)[])
    .map((key) => ({
      key,
      label: labels[key],
      href: cms.social[key],
    }))
    .filter((item) => item.href);

  return (
    <section className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <PageJsonLd path="/social" />
      <PageHeader
        eyebrow="Connect"
        title="Social media"
        description="Follow SmartToolX for new tools and updates. Links are managed from the admin dashboard."
      />
      <div className="bg-line border-line grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border max-[800px]:grid-cols-1">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-2 min-h-[150px] px-[22px] py-[26px]"
          >
            <div className="font-display text-[17px] font-semibold">
              {link.label}
            </div>
            <div className="text-text-dim mt-2 break-all text-[14px] leading-[1.5]">
              {link.href}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
