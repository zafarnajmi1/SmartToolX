import { LegalDocument } from "@/components/pages/LegalDocument";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { getCms } from "@/lib/cms";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/terms");
}

export default async function TermsPage() {
  const cms = await getCms();
  return (
    <>
      <PageJsonLd path="/terms" />
      <LegalDocument eyebrow="Terms" page={cms.terms} />
    </>
  );
}
