import type { Metadata } from "next";
import { getCms } from "@/lib/cms";
import type { SeoEntry } from "@/lib/cms-types";

export async function seoMetadata(pagePath: string): Promise<Metadata> {
  const cms = await getCms();
  const entry = cms.seo[pagePath];
  if (!entry) {
    return {
      title: cms.site.siteName,
      description: DEFAULT_DESCRIPTION,
    };
  }
  return toMetadata(entry, cms.site.siteUrl);
}

function toMetadata(entry: SeoEntry, siteUrl: string): Metadata {
  const images = entry.ogImage
    ? [{ url: entry.ogImage, alt: entry.ogImageAlt }]
    : undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: entry.title },
    description: entry.description,
    keywords: entry.keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    authors: [{ name: entry.author }],
    creator: entry.author,
    publisher: entry.ogSiteName,
    category: entry.focusKeyword,
    alternates: { canonical: entry.canonical },
    robots: {
      index: entry.robotsIndex,
      follow: entry.robotsFollow,
      googleBot: {
        index: entry.robotsIndex,
        follow: entry.robotsFollow,
      },
    },
    openGraph: {
      title: entry.ogTitle,
      description: entry.ogDescription,
      url: entry.canonical,
      siteName: entry.ogSiteName,
      locale: entry.ogLocale,
      type: entry.ogType as "website",
      images,
    },
    twitter: {
      card: entry.twitterCard,
      title: entry.twitterTitle,
      description: entry.twitterDescription,
      images: entry.twitterImage ? [entry.twitterImage] : undefined,
      site: entry.twitterSite,
      creator: entry.twitterCreator,
    },
    other: {
      language: entry.language,
      "og:image:alt": entry.ogImageAlt,
    },
  };
}

const DEFAULT_DESCRIPTION =
  "Free calculators, converters, and file tools that run in your browser.";

export function jsonLdFor(entry: SeoEntry, siteUrl: string) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": entry.schemaType,
    name: entry.h1,
    headline: entry.title,
    description: entry.description,
    url: entry.canonical,
    inLanguage: entry.language,
    author: { "@type": "Organization", name: entry.author, url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: entry.ogSiteName,
      url: siteUrl,
      logo: { "@type": "ImageObject", url: entry.ogImage },
    },
    image: entry.ogImage,
    keywords: entry.keywords,
  };
  if (entry.schemaType === "SoftwareApplication") {
    data.applicationCategory = "UtilitiesApplication";
    data.operatingSystem = "Any";
    data.isAccessibleForFree = true;
    data.offers = { "@type": "Offer", price: "0", priceCurrency: "USD" };
  }
  return data;
}
