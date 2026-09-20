import type { ComponentType, SVGProps } from "react";
import type { NavIconName } from "@/lib/nav";

type IconProps = SVGProps<SVGSVGElement>;

function iconProps(props: IconProps): IconProps {
  return {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

function CalculatorsIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" />
      <path d="M5 4.5h6M5.5 8h1M9.5 8h1M5.5 11h1M9.5 11h1" />
    </svg>
  );
}

function ConvertersIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M2.5 5.5h11M10.5 2.5 13.5 5.5 10.5 8.5" />
      <path d="M13.5 10.5h-11M5.5 7.5 2.5 10.5 5.5 13.5" />
    </svg>
  );
}

function TextIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3 4h10M8 4v8M5.5 12h5" />
    </svg>
  );
}

function FinanceIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5v7M6 6.2c.5-.7 1.2-1 2-1 1.3 0 2.2.7 2.2 1.8s-.9 1.7-2.2 1.7c-1.3 0-2.3.6-2.3 1.8 0 1 .8 1.7 2.3 1.7.9 0 1.6-.3 2.1-1" />
    </svg>
  );
}

function FilesIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4.5 2.5h5l3 3V13.5H4.5z" />
      <path d="M9.5 2.5V5.5H12.5" />
    </svg>
  );
}

function ColorIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="6" cy="7" r="3.5" />
      <circle cx="10" cy="10" r="3.5" />
    </svg>
  );
}

const icons: Record<NavIconName, ComponentType<IconProps>> = {
  calculators: CalculatorsIcon,
  converters: ConvertersIcon,
  text: TextIcon,
  finance: FinanceIcon,
  files: FilesIcon,
  colors: ColorIcon,
};

export function NavIcon({
  name,
  className,
}: {
  name: NavIconName;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} />;
}
