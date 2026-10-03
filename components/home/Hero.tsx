import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ReadoutPanel } from "@/components/home/ReadoutPanel";
import { getRecentHomeTools, toolCount } from "@/lib/tools";

export function Hero() {
  const popular = getRecentHomeTools("all");
  return (
    <section className="relative mx-auto max-w-[1100px] px-12 pt-[90px] pb-[70px] max-[800px]:px-5">
      <div className="text-amber mb-[22px] flex items-center gap-[10px] font-mono text-[13px] tracking-[0.12em] uppercase">
        <span className="bg-amber inline-block size-2 animate-blink" />
        {toolCount}+ free tools · updated weekly
      </div>
      <h1 className="font-display max-w-[800px] text-[64px] leading-[1.08] font-semibold tracking-[-0.01em] max-[800px]:text-[42px]">
        Free online calculators
        <br />
        and <span className="text-amber font-mono font-medium">PDF converter</span>
      </h1>
      <p className="text-text-dim mt-[22px] max-w-[540px] text-[19px] leading-[1.6]">
        Free calculators, converters, and generators. Open a tool, enter your
        numbers, and get the answer in your browser. No account needed.
      </p>
      <div className="mt-[34px] flex flex-wrap gap-[14px]">
        <Button href="/tools">Browse all tools</Button>
        <Button href="/tools/bmi-calculator" variant="secondary">
          Try BMI Calculator
        </Button>
      </div>
      <div className="text-text-dim mt-5 flex max-w-[640px] flex-wrap gap-x-4 gap-y-2 text-[14px]">
        {popular.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="hover:text-text underline-offset-2 hover:underline"
          >
            {tool.name}
          </Link>
        ))}
      </div>
      <ReadoutPanel />
    </section>
  );
}
