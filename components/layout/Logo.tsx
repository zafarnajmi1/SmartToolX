import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "text-[22px]" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-display flex min-w-0 items-center gap-2 font-bold tracking-[0.02em] sm:gap-[10px] ${className}`.trim()}
    >
      <Image
        src="/logo.png"
        alt="SmartToolX"
        width={32}
        height={32}
        className="size-[1.45em] shrink-0"
        priority
      />
      <span className="truncate whitespace-nowrap">
        SmartTool <span className="text-amber">X</span>
      </span>
    </Link>
  );
}
