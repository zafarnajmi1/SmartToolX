import { PageHeader } from "@/components/ui/PageHeader";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { categoryPages, getToolsBySlugs } from "@/lib/tools";

type CategoryKey = keyof typeof categoryPages;

export function CategoryPage({ category }: { category: CategoryKey }) {
  const page = categoryPages[category];
  const listed = getToolsBySlugs(page.slugs);

  return (
    <div className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <PageHeader
        eyebrow="SmartToolX"
        title={page.title}
        description={page.description}
      />
      <ToolGrid tools={listed} />
    </div>
  );
}
