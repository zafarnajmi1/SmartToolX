import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { LegalForm } from "@/components/admin/LegalForm";
import { getCms } from "@/lib/cms";

export default async function AdminPrivacyPage() {
  const cms = await getCms();

  return (
    <AdminShell title="Privacy policy">
      <p className="text-text-dim mb-8 max-w-[640px] text-[14px] leading-[1.6]">
        Edits show on the public{" "}
        <Link href="/privacy" className="text-amber">
          privacy page
        </Link>
        . Separate paragraphs with a blank line.
      </p>
      <LegalForm kind="privacy" initial={cms.privacy} />
    </AdminShell>
  );
}
