import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolGrid } from "@/components/tools/ToolGrid";
import {
  categoryPages,
  featuredSlugs,
  getToolsBySlugs,
} from "@/lib/tools";

type CategoryKey = keyof typeof categoryPages;

export function CategoryPage({ category }: { category: CategoryKey }) {
  const page = categoryPages[category];
  const listed = getToolsBySlugs(page.slugs);
  const featured = new Set<string>(featuredSlugs);
  const popular = [
    ...listed.filter((tool) => featured.has(tool.slug)),
    ...listed.filter((tool) => !featured.has(tool.slug)),
  ].slice(0, 6);

  return (
    <div className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: page.title }]}
      />
      <PageHeader
        eyebrow="SmartToolX"
        title={page.title}
        description={page.description}
      />
      {popular.length > 0 ? (
        <p className="text-text-dim mb-8 max-w-[720px] text-[15px] leading-[1.6]">
          Popular:{" "}
          {popular.map((tool, index) => (
            <span key={tool.slug}>
              {index > 0 ? ", " : ""}
              <Link
                href={`/tools/${tool.slug}`}
                className="text-text underline"
              >
                {tool.name}
              </Link>
            </span>
          ))}
          .
        </p>
      ) : null}
      <ToolGrid tools={listed} />
    </div>
  );
}
