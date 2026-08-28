import { PageHeader } from "@/components/ui/PageHeader";
import type { LegalPage } from "@/lib/cms-types";

export function LegalDocument({
  eyebrow,
  page,
}: {
  eyebrow: string;
  page: LegalPage;
}) {
  const paragraphs = page.content
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <PageHeader
        eyebrow={eyebrow}
        title={page.title}
        description={page.description}
      />
      <div className="text-text-dim max-w-[640px] space-y-4 text-[16px] leading-[1.7]">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
