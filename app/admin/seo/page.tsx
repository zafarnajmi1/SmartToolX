import { AdminShell } from "@/components/admin/AdminShell";
import { SeoForm } from "@/components/admin/SeoForm";
import { getCms } from "@/lib/cms";

export default async function AdminSeoPage() {
  const cms = await getCms();
  const pages = Object.values(cms.seo).sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  return (
    <AdminShell title="SEO pages">
      <p className="text-text-dim mb-8 max-w-[640px] text-[14px] leading-[1.6]">
        Fill title, description, keywords, canonical, robots, Open Graph, and
        Twitter fields for every public URL. Changes apply on save.
      </p>
      <SeoForm pages={pages} />
    </AdminShell>
  );
}
