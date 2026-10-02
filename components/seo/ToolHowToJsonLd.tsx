import { JsonLd } from "@/components/seo/JsonLd";
import { getToolContent } from "@/lib/tool-content";

export function ToolHowToJsonLd({ slug }: { slug: string }) {
  const content = getToolContent(slug);
  if (!content) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: content.articleTitle,
        description: content.paragraphs[0],
        step: content.paragraphs.map((text, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text,
        })),
      }}
    />
  );
}
