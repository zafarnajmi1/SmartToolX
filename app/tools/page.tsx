import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { seoMetadata } from "@/lib/seo";
import { searchTools, toolCount, tools } from "@/lib/tools";

export async function generateMetadata() {
  return seoMetadata("/tools");
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const listed = query ? searchTools(query) : tools;

  return (
    <>
      <PageJsonLd path="/tools" />
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "All tools" }]}
      />
      <PageHeader
        eyebrow={`${toolCount}+ free tools`}
        title="All tools"
        description={
          query
            ? `Results for “${query}”. Every tool runs in your browser.`
            : "Browse calculators, converters, and generators. Every tool runs in your browser."
        }
      />
      <ToolGrid tools={listed} />
    </>
  );
}
