import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { ToolFaqJsonLd } from "@/components/seo/ToolFaqJsonLd";
import { ToolGuide } from "@/components/tools/ToolGuide";
import { ToolWidget } from "@/components/tools/ToolWidget";
import { RelatedTools, ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { seoMetadata } from "@/lib/seo";
import { getTool, tools } from "@/lib/tools";

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

  const related = tools
    .filter((item) => item.category === tool.category && item.slug !== tool.slug)
    .slice(0, 4);

  return (
    <>
      <PageJsonLd path={`/tools/${slug}`} />
      <ToolFaqJsonLd slug={slug} />
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
