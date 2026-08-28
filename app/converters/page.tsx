import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { seoMetadata } from "@/lib/seo";
import { categoryPages, getFileConverterTools, getToolsBySlugs } from "@/lib/tools";

export async function generateMetadata() {
  return seoMetadata("/converters");
}

export default function ConvertersPage() {
  const listed = getToolsBySlugs(categoryPages.converters.slugs);
  const files = getFileConverterTools();

  return (
    <>
      <PageJsonLd path="/converters" />
      <div className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
        <PageHeader
          eyebrow="SmartToolX"
          title={categoryPages.converters.title}
          description={categoryPages.converters.description}
        />
        <ToolGrid tools={listed} />
        <div className="text-text-dim mt-[44px] mb-[32px] font-mono text-[13px] tracking-[0.08em] uppercase">
          File Converters
        </div>
        <ToolGrid tools={files} />
      </div>
    </>
  );
}
