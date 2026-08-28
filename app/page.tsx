import { Hero } from "@/components/home/Hero";
import { MostUsedTools } from "@/components/home/MostUsedTools";
import { TrustStrip } from "@/components/home/TrustStrip";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/");
}

export default function HomePage() {
  return (
    <>
      <PageJsonLd path="/" />
      <Hero />
      <MostUsedTools />
      <TrustStrip />
    </>
  );
}
