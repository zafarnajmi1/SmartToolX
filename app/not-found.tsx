import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1100px] px-12 py-[90px] max-[800px]:px-5">
      <div className="text-amber mb-[22px] flex items-center gap-[10px] font-mono text-[13px] tracking-[0.12em] uppercase">
        <span className="bg-amber inline-block size-2 animate-blink" />
        404
      </div>
      <h1 className="font-display max-w-[800px] text-[64px] leading-[1.08] font-semibold tracking-[-0.01em] max-[800px]:text-[42px]">
        Tool not found
      </h1>
      <p className="text-text-dim mt-[22px] max-w-[540px] text-[19px] leading-[1.6]">
        That page is not in the toolkit. Browse the full list or head back home.
      </p>
      <div className="mt-[34px] flex gap-[14px]">
        <Button href="/tools">Browse all tools</Button>
        <Button href="/" variant="secondary">
          Home
        </Button>
      </div>
    </section>
  );
}
