import { getCms } from "@/lib/cms";
import { jsonLdFor } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getTool, hubByCategory } from "@/lib/tools";

export async function PageJsonLd({ path }: { path: string }) {
  const cms = await getCms();
  const entry = cms.seo[path];
  if (!entry) return null;
  const main = <JsonLd data={jsonLdFor(entry, cms.site.siteUrl)} />;
  if (!path.startsWith("/tools/")) return main;

  const slug = path.replace("/tools/", "");
  const tool = getTool(slug);
  const hub = tool ? hubByCategory[tool.category] : null;
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
              name: hub?.label ?? "Tools",
              item: `${cms.site.siteUrl}${hub?.href ?? "/tools"}`,
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
