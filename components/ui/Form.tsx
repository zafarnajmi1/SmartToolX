"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  const child = Children.only(children);
  const control = isValidElement(child)
    ? cloneElement(child as ReactElement<{ id?: string }>, {
        id: (child.props as { id?: string }).id ?? id,
      })
    : child;

  return (
    <div className="block min-w-0">
      <label
        htmlFor={(control as ReactElement<{ id?: string }>).props?.id ?? id}
        className="text-text-dim mb-1.5 block font-mono text-[12px] tracking-[0.08em] uppercase"
      >
        {label}
      </label>
      {control}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`border-line bg-bg text-text min-w-0 w-full max-w-full rounded-[3px] border px-3 py-[11px] font-mono text-[16px] outline-none focus:border-amber ${props.className ?? ""}`}
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
    <div className="min-w-0 font-mono">
      <div className="text-text-dim mb-1.5 text-[11px] leading-snug tracking-[0.08em] uppercase sm:text-[12px]">
        {label}
      </div>
      <div
        className={`break-words text-[18px] leading-tight sm:text-[24px] ${steel ? "text-steel" : "text-amber"}`}
      >
        {value}
        {hint ? (
          <span className="text-text-dim text-[14px]">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
