import { getCms } from "@/lib/cms";
import { jsonLdFor } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export async function PageJsonLd({ path }: { path: string }) {
  const cms = await getCms();
  const entry = cms.seo[path];
  if (!entry) return null;
  return <JsonLd data={jsonLdFor(entry, cms.site.siteUrl)} />;
}
