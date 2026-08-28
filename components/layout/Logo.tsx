import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="font-display flex items-center gap-[10px] text-[22px] font-bold tracking-[0.02em]"
    >
      <Image
        src="/logo.png"
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0"
        priority
      />
      <span className="whitespace-nowrap">
        SmartTool <span className="text-amber">X</span>
      </span>
    </Link>
  );
}
