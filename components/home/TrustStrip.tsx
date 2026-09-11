import { toolCount } from "@/lib/tools";

const items = [
  {
    value: "0.0s",
    label: "Every calculation runs in your browser. No server delay and no waiting.",
  },
  {
    value: "100%",
    label: "Free, no account required, no paywalled results.",
  },
  {
    value: `${toolCount}+`,
    label:
      "Tools across health, finance, text, files, and conversion. We add more each week.",
  },
];

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-[1100px] px-12 py-[70px] max-[800px]:px-5">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div className="font-display text-[32px] font-semibold">
          Why SmartToolX
        </div>
      </div>
      <div className="bg-line border-line grid grid-cols-3 gap-px overflow-hidden rounded-[8px] border max-[800px]:grid-cols-1">
        {items.map((item) => (
          <div key={item.value} className="bg-surface p-6">
            <div className="text-steel mb-2 font-mono text-[28px]">
              {item.value}
            </div>
            <div className="text-text-dim text-[14px]">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
