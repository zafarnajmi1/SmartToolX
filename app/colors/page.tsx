import { CategoryPage } from "@/components/pages/CategoryPage";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/colors");
}

export default function ColorsPage() {
  return (
    <>
      <PageJsonLd path="/colors" />
      <CategoryPage category="colors" />
    </>
  );
}
