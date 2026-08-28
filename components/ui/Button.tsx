import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "cta";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-amber text-bg font-display font-semibold text-[16px] py-[13px] px-6 rounded-[3px]",
  secondary:
    "border border-line text-text font-display font-semibold text-[16px] py-[13px] px-6 rounded-[3px]",
  cta: "font-mono text-[14px] border border-[#F5C400] text-[#F5C400] py-2 px-4 rounded-[3px]",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${variants[variant]} ${className}`.trim()}>
      {children}
    </Link>
  );
}
