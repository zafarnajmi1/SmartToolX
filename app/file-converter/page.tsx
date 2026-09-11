import { CategoryPage } from "@/components/pages/CategoryPage";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/file-converter");
}

export default function FileConverterPage() {
  return (
    <>
      <PageJsonLd path="/file-converter" />
      <CategoryPage category="file-converter" />
    </>
  );
}
