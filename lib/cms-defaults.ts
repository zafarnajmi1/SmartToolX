import { tools } from "@/lib/tools";
import type { CmsData, SeoEntry } from "@/lib/cms-types";

const SITE_URL = "https://smarttoolx.com";
const OG_IMAGE = `${SITE_URL}/logo.png`;

function seo(
  path: string,
  name: string,
  title: string,
  description: string,
  extra: Partial<SeoEntry> = {},
): SeoEntry {
  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    path,
    name,
    title,
    description,
    keywords:
      extra.keywords ??
      "free calculator, unit converter, BMI calculator, EMI calculator, SmartToolX",
    canonical,
    robotsIndex: extra.robotsIndex ?? true,
    robotsFollow: extra.robotsFollow ?? true,
    author: "SmartToolX",
    language: "en",
    ogTitle: extra.ogTitle ?? title,
    ogDescription: extra.ogDescription ?? description,
    ogType: extra.ogType ?? "website",
    ogImage: extra.ogImage ?? OG_IMAGE,
    ogImageAlt: extra.ogImageAlt ?? "SmartToolX logo",
    ogLocale: "en_US",
    ogSiteName: "SmartToolX",
    twitterCard: extra.twitterCard ?? "summary_large_image",
    twitterTitle: extra.twitterTitle ?? title,
    twitterDescription: extra.twitterDescription ?? description,
    twitterImage: extra.twitterImage ?? OG_IMAGE,
    twitterSite: "@smarttoolx",
    twitterCreator: "@smarttoolx",
    h1: extra.h1 ?? name,
    focusKeyword: extra.focusKeyword ?? name.toLowerCase(),
    schemaType: extra.schemaType ?? "WebPage",
  };
}

const pageSeo: Record<string, SeoEntry> = {
  "/": seo(
    "/",
    "Home",
    "SmartToolX — Every number you need, solved in .04s",
    "Calculators, converters, and generators built for speed and accuracy — no sign-up, no clutter, just the answer.",
    {
      keywords:
        "free online calculators, BMI calculator, EMI calculator, calorie calculator, GST calculator, unit converter, word counter, password generator, SmartToolX",
      h1: "Every number you need, solved in .04s",
      focusKeyword: "free online calculators",
      schemaType: "WebSite",
    },
  ),
  "/tools": seo(
    "/tools",
    "All Tools",
    "All Tools — SmartToolX",
    "Browse calculators, converters, and generators. Every tool runs in your browser.",
    {
      keywords:
        "all tools, calculator list, free converters, SmartToolX tools",
      focusKeyword: "all tools",
    },
  ),
  "/calculators": seo(
    "/calculators",
    "Calculators",
    "Calculators — SmartToolX",
    "Health, finance, and everyday calculators that run in your browser.",
    { keywords: "online calculators, BMI, EMI, age calculator, percentage", focusKeyword: "online calculators" },
  ),
  "/converters": seo(
    "/converters",
    "Converters",
    "Converters — SmartToolX",
    "Currency, units, and more — convert without leaving the page.",
    { keywords: "unit converter, currency converter, live exchange rates", focusKeyword: "unit converter" },
  ),
  "/text-tools": seo(
    "/text-tools",
    "Text Tools",
    "Text Tools — SmartToolX",
    "Count, generate, and transform text in a click.",
    { keywords: "word counter, QR code generator, text tools", focusKeyword: "text tools" },
  ),
  "/finance": seo(
    "/finance",
    "Finance",
    "Finance Tools — SmartToolX",
    "Payments, percentages, and currency tools for money decisions.",
    { keywords: "loan EMI calculator, percentage calculator, currency converter", focusKeyword: "finance calculator" },
  ),
  "/about": seo(
    "/about",
    "About",
    "About — SmartToolX",
    "SmartToolX is a fast, free toolkit of calculators, converters, and generators.",
    { keywords: "about SmartToolX, free calculator website", focusKeyword: "about SmartToolX", schemaType: "AboutPage" },
  ),
  "/contact": seo(
    "/contact",
    "Contact",
    "Contact — SmartToolX",
    "Get in touch with the SmartToolX team.",
    { keywords: "contact SmartToolX, calculator support", focusKeyword: "contact SmartToolX", schemaType: "ContactPage" },
  ),
  "/privacy": seo(
    "/privacy",
    "Privacy Policy",
    "Privacy Policy — SmartToolX",
    "How SmartToolX handles your data. Tools calculate locally in your browser.",
    { keywords: "privacy policy, data protection, SmartToolX privacy", focusKeyword: "privacy policy", schemaType: "WebPage" },
  ),
  "/terms": seo(
    "/terms",
    "Terms and Conditions",
    "Terms and Conditions — SmartToolX",
    "Terms of use for SmartToolX calculators, converters, and generators.",
    { keywords: "terms and conditions, terms of use, SmartToolX", focusKeyword: "terms and conditions" },
  ),
  "/social": seo(
    "/social",
    "Social Media",
    "Social Media — SmartToolX",
    "Follow SmartToolX on social media for new tools and updates.",
    { keywords: "SmartToolX social media, Facebook, Twitter, Instagram, LinkedIn", focusKeyword: "SmartToolX social media" },
  ),
};

for (const tool of tools) {
  const path = `/tools/${tool.slug}`;
  pageSeo[path] = seo(
    path,
    tool.name,
    `${tool.name} — SmartToolX`,
    tool.description,
    {
      keywords: `${tool.name}, free ${tool.name.toLowerCase()} online, ${tool.name.toLowerCase()}, ${tool.category} calculator, SmartToolX`,
      h1: tool.name,
      focusKeyword: tool.name.toLowerCase(),
      schemaType: "SoftwareApplication",
    },
  );
}

export const DEFAULT_CMS: CmsData = {
  site: {
    siteUrl: SITE_URL,
    siteName: "SmartToolX",
    defaultOgImage: OG_IMAGE,
    googleSiteVerification: "",
    bingVerification: "",
    facebookAppId: "",
  },
  social: {
    facebook: "https://facebook.com/smarttoolx",
    twitter: "https://x.com/smarttoolx",
    instagram: "https://instagram.com/smarttoolx",
    linkedin: "https://linkedin.com/company/smarttoolx",
    youtube: "https://youtube.com/@smarttoolx",
    tiktok: "https://tiktok.com/@smarttoolx",
    pinterest: "https://pinterest.com/smarttoolx",
    github: "https://github.com/smarttoolx",
    threads: "https://threads.net/@smarttoolx",
    discord: "",
  },
  privacy: {
    title: "Your inputs stay in your browser",
    description:
      "SmartToolX tools calculate locally. We do not require an account and we do not store the numbers you type into a calculator.",
    lastUpdated: "August 26, 2026",
    content: `SmartToolX tools calculate locally in your browser. We do not require an account and we do not store the numbers you type into a calculator.

Contact form submissions are used only to reply to you. QR codes are generated from the text you enter so the encoded content is visible in the request used to draw the image.

This site may use basic analytics to understand which tools are used. Calculations are provided for informational use only.

We may update this policy as the site grows. The date at the top of this page shows the latest revision.`,
  },
  terms: {
    title: "Terms and Conditions",
    description:
      "By using SmartToolX you agree to these terms. Tools are free, run in your browser, and are for informational use only.",
    lastUpdated: "August 26, 2026",
    content: `By accessing or using SmartToolX you agree to these terms. If you do not agree, do not use the site.

SmartToolX provides free calculators, converters, and generators. Results are for informational purposes only. They are not professional, medical, financial, or legal advice. Always verify important numbers independently.

You may use the tools for personal or commercial purposes. You may not scrape, overload, or attempt to disrupt the service, or present the site as your own.

All calculations run in your browser unless a tool clearly needs a network request (for example live currency rates or QR image generation). We do not guarantee uninterrupted availability or error-free results.

SmartToolX, the logo, and the site design are the property of SmartToolX. You may not copy the brand or design for a competing service.

We may change tools, these terms, or the site at any time. Continued use after a change means you accept the updated terms.

To the fullest extent allowed by law, SmartToolX is not liable for losses arising from use of the tools or inability to use the site.

Questions about these terms can be sent through the Contact page.`,
  },
  seo: pageSeo,
};

export const SEO_PAGE_LIST = Object.values(pageSeo).map((entry) => ({
  path: entry.path,
  name: entry.name,
}));
