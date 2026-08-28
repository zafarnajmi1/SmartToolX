import { TrustStrip } from "@/components/home/TrustStrip";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/about");
}

export default function AboutPage() {
  return (
    <>
      <PageJsonLd path="/about" />
      <section className="mx-auto max-w-[1100px] px-12 pt-[70px] max-[800px]:px-5">
        <PageHeader
          eyebrow="About"
          title="A toolkit that stays out of the way"
          description="SmartToolX is built for one job: give you the number, the conversion, or the count — immediately. No accounts, no ads in the result, no extra steps."
        />
        <div className="text-text-dim max-w-[640px] space-y-4 text-[16px] leading-[1.7]">
          <p>
            Every tool runs locally in your browser. That keeps results instant
            and keeps your inputs on your device. We add tools weekly across
            health, finance, text, and conversion.
          </p>
          <p>
            Use the answers as a starting point. They are for informational use
            only and are not a substitute for professional advice.
          </p>
        </div>
      </section>
      <TrustStrip />
    </>
  );
}
