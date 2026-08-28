import { CategoryPage } from "@/components/pages/CategoryPage";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/finance");
}

export default function FinancePage() {
  return (
    <>
      <PageJsonLd path="/finance" />
      <CategoryPage category="finance" />
    </>
  );
}
