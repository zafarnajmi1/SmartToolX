import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { seoMetadata } from "@/lib/seo";
import { toolCount, tools } from "@/lib/tools";

export async function generateMetadata() {
  return seoMetadata("/tools");
}

export default function ToolsPage() {
  return (
    <>
      <PageJsonLd path="/tools" />
      <PageHeader
        eyebrow={`${toolCount}+ free tools`}
        title="All tools"
        description="Browse calculators, converters, and generators. Every tool runs in your browser."
      />
      <ToolGrid tools={tools} />
    </>
  );
}
