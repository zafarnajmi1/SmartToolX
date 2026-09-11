import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { SocialForm } from "@/components/admin/SocialForm";
import { getCms } from "@/lib/cms";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/admin/social");
}

export default async function AdminSocialPage() {
  const cms = await getCms();

  return (
    <AdminShell title="Social media">
      <p className="text-text-dim mb-8 max-w-[640px] text-[14px] leading-[1.6]">
        These links appear on the public{" "}
        <Link href="/social" className="text-amber">
          social media page
        </Link>
        . Leave a field empty to hide that network.
      </p>
      <SocialForm initial={cms.social} />
    </AdminShell>
  );
}
