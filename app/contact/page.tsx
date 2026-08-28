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
        eyebrow="Contact"
        title="Tell us what to build next"
        description="Questions, corrections, or a tool you want added — send a note and we will take a look."
      />
      <ContactForm />
    </section>
  );
}
