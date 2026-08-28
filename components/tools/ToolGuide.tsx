import { getToolContent } from "@/lib/tool-content";

export function ToolGuide({ slug }: { slug: string }) {
  const content = getToolContent(slug);
  if (!content) return null;

  return (
    <div className="mt-[70px]">
      <h2 className="font-display text-[32px] font-semibold">
        {content.articleTitle}
      </h2>
      <div className="text-text-dim mt-4 max-w-[720px] space-y-4 text-[16px] leading-[1.7]">
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
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
