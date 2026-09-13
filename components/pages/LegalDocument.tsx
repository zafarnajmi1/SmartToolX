import { PageHeader } from "@/components/ui/PageHeader";
import type { LegalPage } from "@/lib/cms-types";

function renderBlocks(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith("## ")) {
        const [heading, ...rest] = block.slice(3).split("\n");
        const body = rest.join(" ").trim();
        return (
          <div key={index} className="space-y-3 pt-4 first:pt-0">
            <h2 className="font-display text-text text-[20px] font-semibold">
              {heading.trim()}
            </h2>
            {body ? <p>{body}</p> : null}
          </div>
        );
      }

      return <p key={index}>{block}</p>;
    });
}

export function LegalDocument({
  eyebrow,
  page,
}: {
  eyebrow: string;
  page: LegalPage;
}) {
  return (
    <section className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <PageHeader
        eyebrow={eyebrow}
        title={page.title}
        description={page.description}
      />
      {page.lastUpdated ? (
        <p className="text-steel mb-6 font-mono text-[13px]">
          Last updated: {page.lastUpdated}
        </p>
      ) : null}
      <div className="text-text-dim max-w-[640px] space-y-4 text-[16px] leading-[1.7]">
        {renderBlocks(page.content)}
      </div>
    </section>
  );
}
