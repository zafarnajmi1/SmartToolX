import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LegalForm } from "@/components/admin/LegalForm";
import { getCms } from "@/lib/cms";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/admin/terms");
}

export default async function AdminTermsPage() {
  const cms = await getCms();

  return (
    <AdminShell title="Terms and conditions">
      <p className="text-text-dim mb-8 max-w-[640px] text-[14px] leading-[1.6]">
        Edits show on the public{" "}
        <Link href="/terms" className="text-amber">
          terms page
        </Link>
        . Separate paragraphs with a blank line.
      </p>
      <LegalForm kind="terms" initial={cms.terms} />
    </AdminShell>
  );
}
