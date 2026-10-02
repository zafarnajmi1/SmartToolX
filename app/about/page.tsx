import Link from "next/link";
import { TrustStrip } from "@/components/home/TrustStrip";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { seoMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return seoMetadata("/about");
}

export default function AboutPage() {
  return (
    <>
      <PageJsonLd path="/about" />
      <section className="mx-auto max-w-[1100px] px-12 pt-[70px] max-[800px]:px-5">
        <Breadcrumbs
          items={[{ href: "/", label: "Home" }, { label: "About Us" }]}
        />
        <PageHeader
          eyebrow="About Us"
          title="About Us"
          description="SmartToolX is a free website of calculators, converters, text tools, and file tools. You get the result in your browser. No account is required."
        />
        <div className="text-text-dim max-w-[640px] space-y-4 text-[16px] leading-[1.7]">
          <h2 className="font-display text-text pt-2 text-[20px] font-semibold">
            Who we are
          </h2>
          <p>
            SmartToolX is built for one job: give you the number, the
            conversion, or the file you need without extra steps. The site is
            run at smarttoolx.com and is free to use.
          </p>
          <h2 className="font-display text-text pt-2 text-[20px] font-semibold">
            What you can do here
          </h2>
          <p>
            Use health and everyday calculators such as the{" "}
            <Link href="/tools/bmi-calculator" className="text-text underline">
              BMI calculator
            </Link>
            ,{" "}
            <Link href="/tools/tdee-calculator" className="text-text underline">
              TDEE calculator
            </Link>
            , and calorie needs. Convert units and currencies. Count words or{" "}
            <Link
              href="/tools/remove-duplicate-lines"
              className="text-text underline"
            >
              remove duplicate lines
            </Link>
            . Estimate EMI, SIP, GST, and{" "}
            <Link href="/tools/roi-calculator" className="text-text underline">
              ROI
            </Link>
            . Convert, compress, and merge files with{" "}
            <Link href="/tools/jpg-to-pdf" className="text-text underline">
              JPG to PDF
            </Link>{" "}
            and the{" "}
            <Link
              href="/tools/image-compressor"
              className="text-text underline"
            >
              image compressor
            </Link>
            . Browse{" "}
            <Link href="/colors" className="text-text underline">
              color tools
            </Link>{" "}
            such as{" "}
            <Link href="/tools/hex-to-cmyk" className="text-text underline">
              HEX to CMYK
            </Link>
            .
          </p>
          <h2 className="font-display text-text pt-2 text-[20px] font-semibold">
            How the tools work
          </h2>
          <p>
            Most tools run locally in your browser. That keeps results instant
            and keeps your inputs on your device. Calculators use standard
            published formulas such as Mifflin-St Jeor for TDEE and BMR. A few
            tools need a short network request, such as live currency rates.
            File converters process files in your browser and do not ask you to
            create an account.
          </p>
          <h2 className="font-display text-text pt-2 text-[20px] font-semibold">
            Accuracy and advice
          </h2>
          <p>
            Use the answers as a starting point. Results are for informational
            use only and are not a substitute for professional medical,
            financial, or legal advice. Always check important numbers before
            you act on them.
          </p>
          <h2 className="font-display text-text pt-2 text-[20px] font-semibold">
            Questions
          </h2>
          <p>
            If a result looks wrong, or you want a tool added, send a note on
            the{" "}
            <Link href="/contact" className="text-text underline">
              Contact Us
            </Link>{" "}
            page. You can also read our{" "}
            <Link href="/privacy" className="text-text underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-text underline">
              Terms and Conditions
            </Link>
            .
          </p>
        </div>
      </section>
      <TrustStrip />
    </>
  );
}
