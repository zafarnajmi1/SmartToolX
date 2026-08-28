import { JsonLd } from "@/components/seo/JsonLd";
import { getToolContent } from "@/lib/tool-content";

export function ToolFaqJsonLd({ slug }: { slug: string }) {
  const content = getToolContent(slug);
  if (!content) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}
