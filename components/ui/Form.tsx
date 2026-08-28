import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-text-dim mb-1.5 block font-mono text-[12px] tracking-[0.08em] uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`border-line bg-bg text-text w-full rounded-[3px] border px-3 py-[11px] font-mono text-[16px] outline-none focus:border-amber ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`border-line bg-bg text-text w-full rounded-[3px] border px-3 py-[11px] font-mono text-[16px] outline-none focus:border-amber ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`border-line bg-bg text-text w-full rounded-[3px] border px-3 py-[11px] font-sans text-[16px] outline-none focus:border-amber ${props.className ?? ""}`}
    />
  );
}

export function Result({
  label,
  value,
  hint,
  steel = false,
}: {
  label: string;
  value: string;
  hint?: string;
  steel?: boolean;
}) {
  return (
    <div className="font-mono">
      <div className="text-text-dim mb-1.5 text-[12px] tracking-[0.08em] uppercase">
        {label}
      </div>
      <div className={`text-[24px] ${steel ? "text-steel" : "text-amber"}`}>
        {value}
        {hint ? (
          <span className="text-text-dim text-[14px]">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
