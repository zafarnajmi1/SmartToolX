import type { ComponentType, SVGProps } from "react";
import type { SocialLinks } from "@/lib/cms-types";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
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

const icons: Record<keyof SocialLinks, ComponentType<IconProps>> = {
  facebook: (props) => (
    <svg {...base(props)}>
      <path d="M10 3H8.5A2.5 2.5 0 0 0 6 5.5V7H4.5v2H6v5h2V9h2l.5-2H8V5.7c0-.4.2-.7.7-.7H10V3Z" />
    </svg>
  ),
  twitter: (props) => (
    <svg {...base(props)}>
      <path d="M2.5 2.5 7 8.2 2.8 13.5h1.7L8 9.3l3.4 4.2h2.3L8.9 7.6 12.9 2.5h-1.7L8 6.5 4.8 2.5H2.5Z" />
    </svg>
  ),
  instagram: (props) => (
    <svg {...base(props)}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="3" />
      <circle cx="8" cy="8" r="2.5" />
      <circle cx="11.2" cy="4.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (props) => (
    <svg {...base(props)}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <path d="M5 7v4M5 5.2v.2M8 11V8.2c0-.7.6-1.2 1.3-1.2s1.2.5 1.2 1.2V11" />
    </svg>
  ),
  youtube: (props) => (
    <svg {...base(props)}>
      <rect x="1.5" y="4" width="13" height="8" rx="2" />
      <path d="M7 6.5 10 8 7 9.5V6.5Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (props) => (
    <svg {...base(props)}>
      <path d="M9 3v6.2a2.2 2.2 0 1 1-2-2.2V5.2A4.5 4.5 0 0 0 11 7.5V5.2A4 4 0 0 0 13.5 4" />
    </svg>
  ),
  pinterest: (props) => (
    <svg {...base(props)}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M7 12.5 8.2 7.5M9.5 8.2A1.7 1.7 0 1 0 7.4 6.6" />
    </svg>
  ),
  github: (props) => (
    <svg {...base(props)}>
      <path d="M6 13.5c-3.5 1-3.5-2-5-2m10 3.5v-3.2a2.4 2.4 0 0 0-.7-1.9c2.3-.2 4.7-1.1 4.7-5a3.8 3.8 0 0 0-1-2.6 3.5 3.5 0 0 0-.1-2.6s-.8-.2-2.6 1a9 9 0 0 0-4.6 0c-1.8-1.2-2.6-1-2.6-1a3.5 3.5 0 0 0-.1 2.6 3.8 3.8 0 0 0-1 2.6c0 3.9 2.4 4.8 4.7 5a2.4 2.4 0 0 0-.7 1.8v3.3" />
    </svg>
  ),
  threads: (props) => (
    <svg {...base(props)}>
      <path d="M8 3.5c3 0 4.5 1.6 4.5 4.2 0 3.4-2.6 4.8-4.5 4.8S3.5 11 3.5 8.2C3.5 5.2 5.2 3.5 8 3.5Z" />
      <path d="M6 8c0-1.5 3.8-2 3.8.4 0 1.6-1.5 2-2.3 2-.8 0-1.7-.3-1.7-1.2 0-1.6 4.4-1.3 4.4.6 0 1.4-1.2 2.2-2.6 2.2" />
    </svg>
  ),
  discord: (props) => (
    <svg {...base(props)}>
      <path d="M4.2 4.5A9 9 0 0 1 8 3.8a9 9 0 0 1 3.8.7l.7 2.2c.7 2 .9 4 .5 6l-1.8.8-1-.9a5 5 0 0 1-4.4 0l-1 .9-1.8-.8c-.4-2-.2-4 .5-6l.7-2.2ZM6.2 10.2c.4 0 .7-.4.7-.8s-.3-.8-.7-.8-.8.4-.8.8.4.8.8.8Zm3.6 0c.4 0 .8-.4.8-.8s-.4-.8-.8-.8-.7.4-.7.8.3.8.7.8Z" />
    </svg>
  ),
};

export function SocialIcon({
  name,
  className,
}: {
  name: keyof SocialLinks;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} />;
}
