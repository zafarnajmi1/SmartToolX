import Link from "next/link";
import { getToolContent } from "@/lib/tool-content";
import { getRelatedTools } from "@/lib/tools";

export function ToolGuide({ slug }: { slug: string }) {
  const content = getToolContent(slug);
  if (!content) return null;
  const related = getRelatedTools(slug, 4);

  return (
    <div className="mt-[70px]">
      <h2 className="font-display text-[32px] font-semibold">
        {content.articleTitle}
      </h2>
      <div className="text-text-dim mt-4 max-w-[720px] space-y-4 text-[16px] leading-[1.7]">
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
        {related.length > 0 ? (
          <p>
            Also try{" "}
            {related.map((tool, index) => (
              <span key={tool.slug}>
                {index > 0 ? ", " : ""}
                <Link
                  href={`/tools/${tool.slug}`}
                  className="text-text underline"
                >
                  {tool.name}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : null}
      </div>
      <h2 className="font-display mt-[70px] mb-9 text-[32px] font-semibold">
        {content.keyword} FAQ
      </h2>
      <div className="bg-line border-line grid gap-px overflow-hidden rounded-[8px] border">
        {content.faqs.map((item) => (
          <div key={item.q} className="bg-surface px-[22px] py-[26px]">
            <div className="font-display text-[17px] font-semibold">{item.q}</div>
            <p className="text-text-dim mt-2 text-[15px] leading-[1.6]">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
