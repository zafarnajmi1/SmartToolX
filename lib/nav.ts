export const navLinks = [
  { href: "/calculators", label: "Calculators", icon: "calculators" },
  { href: "/converters", label: "Converters", icon: "converters" },
  { href: "/text-tools", label: "Text Tools", icon: "text" },
  { href: "/finance", label: "Finance", icon: "finance" },
  { href: "/file-converter", label: "File Converter", icon: "files" },
  { href: "/about", label: "About", icon: "about" },
] as const;

export const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export type NavIconName = (typeof navLinks)[number]["icon"];
