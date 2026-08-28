import { CategoryPage } from "@/components/pages/CategoryPage";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/text-tools");
}

export default function TextToolsPage() {
  return (
    <>
      <PageJsonLd path="/text-tools" />
      <CategoryPage category="text-tools" />
    </>
  );
}
