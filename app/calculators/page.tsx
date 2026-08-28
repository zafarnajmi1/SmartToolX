import { CategoryPage } from "@/components/pages/CategoryPage";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/calculators");
}

export default function CalculatorsPage() {
  return (
    <>
      <PageJsonLd path="/calculators" />
      <CategoryPage category="calculators" />
    </>
  );
}
