import { ContactForm } from "@/components/pages/ContactForm";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/contact");
}

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <PageJsonLd path="/contact" />
      <PageHeader
        eyebrow="Contact Us"
        title="Contact Us"
        description="Questions, corrections, or a tool you want added? Send a note and we will take a look."
      />
      <div className="text-text-dim mb-8 max-w-[640px] space-y-4 text-[16px] leading-[1.7]">
        <p>
          Use this page to reach the SmartToolX team. We read messages about
          broken tools, wrong results, privacy questions, and new calculator or
          converter requests.
        </p>
        <p>
          Include the page URL and what you expected to happen. That helps us
          fix issues faster. We aim to reply when a response is needed.
        </p>
      </div>
      <ContactForm />
    </section>
  );
}
