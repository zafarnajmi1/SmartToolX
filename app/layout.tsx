import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { getCms } from "@/lib/cms";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCms();
  const home = cms.seo["/"];
  return {
    metadataBase: new URL(cms.site.siteUrl),
    title: {
      default: home?.title ?? "SmartToolX",
      template: "%s",
    },
    description: home?.description,
    icons: { icon: "/logo.png" },
    verification: {
      google: cms.site.googleSiteVerification || undefined,
      other: cms.site.bingVerification
        ? { "msvalidate.01": cms.site.bingVerification }
        : undefined,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cms = await getCms();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppShell social={cms.social}>{children}</AppShell>
      </body>
    </html>
  );
}
