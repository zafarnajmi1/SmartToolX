export type SeoEntry = {
  path: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  author: string;
  language: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  ogImage: string;
  ogImageAlt: string;
  ogLocale: string;
  ogSiteName: string;
  twitterCard: "summary" | "summary_large_image";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
  twitterCreator: string;
  h1: string;
  focusKeyword: string;
  schemaType: string;
};

export type SocialLinks = {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  pinterest: string;
  github: string;
  threads: string;
  discord: string;
};

export type LegalPage = {
  title: string;
  description: string;
  content: string;
  lastUpdated: string;
};

export type CmsData = {
  site: {
    siteUrl: string;
    siteName: string;
    defaultOgImage: string;
    googleSiteVerification: string;
    bingVerification: string;
    facebookAppId: string;
  };
  social: SocialLinks;
  privacy: LegalPage;
  terms: LegalPage;
  seo: Record<string, SeoEntry>;
};
