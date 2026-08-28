import { Button } from "@/components/ui/Button";
import { ReadoutPanel } from "@/components/home/ReadoutPanel";
import { toolCount } from "@/lib/tools";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-[1100px] px-12 pt-[90px] pb-[70px] max-[800px]:px-5">
      <div className="text-amber mb-[22px] flex items-center gap-[10px] font-mono text-[13px] tracking-[0.12em] uppercase">
        <span className="bg-amber inline-block size-2 animate-blink" />
        {toolCount}+ free tools · updated weekly
      </div>
      <h1 className="font-display max-w-[800px] text-[64px] leading-[1.08] font-semibold tracking-[-0.01em] max-[800px]:text-[42px]">
        Every number you need,
        <br />
        solved <span className="text-amber font-mono font-medium">in .04s</span>
      </h1>
      <p className="text-text-dim mt-[22px] max-w-[540px] text-[19px] leading-[1.6]">
        Calculators, converters, and generators built for speed and accuracy —
        no sign-up, no clutter, just the answer.
      </p>
      <div className="mt-[34px] flex flex-wrap gap-[14px]">
        <Button href="/tools">Browse all tools</Button>
        <Button href="/tools/bmi-calculator" variant="secondary">
          Try BMI Calculator
        </Button>
      </div>
      <ReadoutPanel />
    </section>
  );
}
