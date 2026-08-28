export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-9">
      {eyebrow ? (
        <div className="text-amber mb-3 flex items-center gap-[10px] font-mono text-[13px] tracking-[0.12em] uppercase">
          <span className="bg-amber inline-block size-2 animate-blink" />
          {eyebrow}
        </div>
      ) : null}
      <h1 className="font-display text-[32px] font-semibold">{title}</h1>
      {description ? (
        <p className="text-text-dim mt-2 max-w-[540px] text-[16px] leading-[1.6]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
