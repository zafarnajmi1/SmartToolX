import { getCms } from "@/lib/cms";
import { jsonLdFor } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export async function PageJsonLd({ path }: { path: string }) {
  const cms = await getCms();
  const entry = cms.seo[path];
  if (!entry) return null;
  const main = <JsonLd data={jsonLdFor(entry, cms.site.siteUrl)} />;
  if (!path.startsWith("/tools/")) return main;

  const toolName = entry.h1 || entry.name;
  return (
    <>
      {main}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: cms.site.siteUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Tools",
              item: `${cms.site.siteUrl}/tools`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: toolName,
              item: entry.canonical,
            },
          ],
        }}
      />
    </>
  );
}
