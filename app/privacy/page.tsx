import { LegalDocument } from "@/components/pages/LegalDocument";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { getCms } from "@/lib/cms";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/privacy");
}

export default async function PrivacyPage() {
  const cms = await getCms();
  return (
    <>
      <PageJsonLd path="/privacy" />
      <LegalDocument eyebrow="Privacy" page={cms.privacy} />
    </>
  );
}
