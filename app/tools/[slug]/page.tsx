import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { ToolFaqJsonLd } from "@/components/seo/ToolFaqJsonLd";
import { ToolHowToJsonLd } from "@/components/seo/ToolHowToJsonLd";
import { ToolGuide } from "@/components/tools/ToolGuide";
import { ToolWidget } from "@/components/tools/ToolWidget";
import { RelatedTools, ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { seoMetadata } from "@/lib/seo";
import { getRelatedTools, getTool, hubByCategory, tools } from "@/lib/tools";

type ToolParams = { slug: string };

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ToolParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  return seoMetadata(`/tools/${slug}`);
}

export default async function ToolPage({
  params,
}: {
  params: Promise<ToolParams>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const related = getRelatedTools(tool.slug);

  return (
    <>
      <PageJsonLd path={`/tools/${slug}`} />
      <ToolFaqJsonLd slug={slug} />
      <ToolHowToJsonLd slug={slug} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          {
            href: hubByCategory[tool.category].href,
            label: hubByCategory[tool.category].label,
          },
          { label: tool.name },
        ]}
      />
      <ToolWorkspace
        icon={tool.icon}
        name={tool.name}
        description={tool.description}
      >
        <ToolWidget slug={tool.slug} />
      </ToolWorkspace>
      <ToolGuide slug={slug} />
      <RelatedTools tools={related} />
    </>
  );
}
