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
    author: extra.author ?? "SmartToolX",
    language: extra.language ?? "en",
    ogTitle: extra.ogTitle ?? title,
    ogDescription: extra.ogDescription ?? description,
    ogType: extra.ogType ?? "website",
    ogImage: extra.ogImage ?? OG_IMAGE,
    ogImageAlt: extra.ogImageAlt ?? "SmartToolX logo",
    ogLocale: extra.ogLocale ?? "en_US",
    ogSiteName: extra.ogSiteName ?? "SmartToolX",
    twitterCard: extra.twitterCard ?? "summary_large_image",
    twitterTitle: extra.twitterTitle ?? title,
    twitterDescription: extra.twitterDescription ?? description,
    twitterImage: extra.twitterImage ?? OG_IMAGE,
    twitterSite: extra.twitterSite ?? "@smarttoolx",
    twitterCreator: extra.twitterCreator ?? "@smarttoolx",
    h1: extra.h1 ?? name,
    focusKeyword: extra.focusKeyword ?? name.toLowerCase(),
    schemaType: extra.schemaType ?? "WebPage",
  };
}

const hidden = { robotsIndex: false, robotsFollow: false } as const;

const TOOL_SEO: Record<
  string,
  { title: string; description: string; keywords: string; focusKeyword: string }
> = {
  "percentage-calculator": {
    title: "Free Percentage Calculator Online | SmartToolX",
    description:
      "Find what percent one number is of another, plus the increased total. Use it for discounts, marks, tips, and tax. Results update as you type.",
    keywords:
      "percentage calculator, what is x percent of y, percent increase calculator, discount percent, free percentage calculator",
    focusKeyword: "percentage calculator",
  },
  "bmi-calculator": {
    title: "Free BMI Calculator Online | SmartToolX",
    description:
      "Check your BMI with cm, meters, feet and inches, kg, lb, or stone. Mix units if you need to. See the WHO category in your browser.",
    keywords:
      "BMI calculator, body mass index calculator, free BMI calculator online, BMI chart, BMI feet inches, BMI stone, kg to BMI",
    focusKeyword: "BMI calculator",
  },
  "loan-emi-calculator": {
    title: "Free Loan EMI Calculator Online | SmartToolX",
    description:
      "Work out the monthly EMI, total interest, and amount payable for home, car, or personal loans. Enter amount, rate, and tenure.",
    keywords:
      "EMI calculator, loan EMI calculator, monthly loan payment, home loan EMI, personal loan calculator",
    focusKeyword: "EMI calculator",
  },
  "word-counter": {
    title: "Free Word Counter Online | SmartToolX",
    description:
      "Count words, characters, and reading time as you type or paste. Built for essays, captions, and SEO drafts. Nothing is uploaded.",
    keywords:
      "word counter, character counter, word count tool, reading time calculator, free word counter online",
    focusKeyword: "word counter",
  },
  "currency-converter": {
    title: "Live Currency Converter | SmartToolX",
    description:
      "Convert 150+ currencies with live mid-market rates. USD, EUR, GBP, INR, and more. Rates refresh about once a minute.",
    keywords:
      "currency converter, live exchange rates, USD to INR, EUR to USD, free currency converter",
    focusKeyword: "currency converter",
  },
  "age-calculator": {
    title: "Free Age Calculator Online | SmartToolX",
    description:
      "Find exact age in years, months, and days from a date of birth. Useful for forms, records, and quick checks.",
    keywords:
      "age calculator, exact age calculator, age in years months days, date of birth calculator",
    focusKeyword: "age calculator",
  },
  "qr-code-generator": {
    title: "Free QR Code Generator Online | SmartToolX",
    description:
      "Turn a link or short text into a scannable QR code. Download the image and use it on print or screens.",
    keywords:
      "QR code generator, free QR code, create QR code from URL, QR maker online",
    focusKeyword: "QR code generator",
  },
  "unit-converter": {
    title: "Free Unit Converter Online | SmartToolX",
    description:
      "Convert length, weight, volume, temperature, area, speed, and more with standard SI factors. Pick a type and get the result instantly.",
    keywords:
      "unit converter, km to miles, kg to lbs, cm to inches, free unit converter online",
    focusKeyword: "unit converter",
  },
  "calorie-calculator": {
    title: "Free Calorie Calculator (TDEE) | SmartToolX",
    description:
      "Estimate daily calories to maintain weight from age, sex, height, weight, and activity. Use cm, feet, kg, lb, or stone. Mifflin-St Jeor TDEE in your browser.",
    keywords:
      "calorie calculator, TDEE calculator, daily calorie needs, maintenance calories, Mifflin-St Jeor, calorie calculator feet inches",
    focusKeyword: "calorie calculator",
  },
  "bmr-calculator": {
    title: "Free BMR Calculator Online | SmartToolX",
    description:
      "Find basal metabolic rate with the Mifflin-St Jeor formula. Use cm, meters, feet and inches, kg, lb, or stone. Age, sex, height, and weight stay in your browser.",
    keywords:
      "BMR calculator, basal metabolic rate calculator, Mifflin-St Jeor, resting calories, BMR feet inches, BMR stone",
    focusKeyword: "BMR calculator",
  },
  "body-fat-calculator": {
    title: "Free Body Fat Calculator Online | SmartToolX",
    description:
      "Estimate body fat percentage from BMI, age, and sex using the Deurenberg method. A quick screening number, not a lab test.",
    keywords:
      "body fat calculator, body fat percentage calculator, Deurenberg, estimate body fat",
    focusKeyword: "body fat calculator",
  },
  "pregnancy-due-date-calculator": {
    title: "Free Due Date Calculator Online | SmartToolX",
    description:
      "Estimate your due date from the first day of your last period using Naegele’s 280-day rule. Informational only, not medical advice.",
    keywords:
      "due date calculator, pregnancy due date, EDD calculator, last period due date",
    focusKeyword: "due date calculator",
  },
  "ovulation-calculator": {
    title: "Free Ovulation Calculator Online | SmartToolX",
    description:
      "Estimate ovulation day and the fertile window from cycle length and the first day of your last period.",
    keywords:
      "ovulation calculator, fertile window calculator, ovulation date, cycle tracker calculator",
    focusKeyword: "ovulation calculator",
  },
  "water-intake-calculator": {
    title: "Free Water Intake Calculator | SmartToolX",
    description:
      "Get a daily water goal from body weight using a simple 35 ml per kg guide. Adjust for heat and activity on your own.",
    keywords:
      "water intake calculator, daily water intake, how much water should I drink, hydration calculator",
    focusKeyword: "water intake calculator",
  },
  "compound-interest-calculator": {
    title: "Free Compound Interest Calculator | SmartToolX",
    description:
      "See how principal, rate, time, and compounding grow a balance. Useful for savings, deposits, and investment planning.",
    keywords:
      "compound interest calculator, compound interest formula, future value calculator, investment growth",
    focusKeyword: "compound interest calculator",
  },
  "gst-calculator": {
    title: "Free GST Calculator Online | SmartToolX",
    description:
      "Add or remove GST or VAT from any amount. See the tax and the gross or net total in one step.",
    keywords:
      "GST calculator, VAT calculator, add GST, remove GST, tax inclusive calculator",
    focusKeyword: "GST calculator",
  },
  "tip-calculator": {
    title: "Free Tip Calculator Online | SmartToolX",
    description:
      "Split a bill with tip. Enter the total, tip percent, and number of people to see what each person pays.",
    keywords:
      "tip calculator, bill splitter, restaurant tip calculator, gratuity calculator",
    focusKeyword: "tip calculator",
  },
  "discount-calculator": {
    title: "Free Discount Calculator Online | SmartToolX",
    description:
      "Find the sale price and how much you save from an original price and discount percent. Handy for shopping and invoices.",
    keywords:
      "discount calculator, sale price calculator, percent off calculator, how much do I save",
    focusKeyword: "discount calculator",
  },
  "sip-calculator": {
    title: "Free SIP Calculator Online | SmartToolX",
    description:
      "Estimate the future value of monthly SIP investments from amount, expected return, and years.",
    keywords:
      "SIP calculator, systematic investment plan calculator, mutual fund SIP, monthly SIP returns",
    focusKeyword: "SIP calculator",
  },
  "simple-interest-calculator": {
    title: "Free Simple Interest Calculator | SmartToolX",
    description:
      "Calculate simple interest and the total payable from principal, annual rate, and time. Clear numbers for short-term loans.",
    keywords:
      "simple interest calculator, simple interest formula, interest on loan calculator",
    focusKeyword: "simple interest calculator",
  },
  "case-converter": {
    title: "Free Case Converter Online | SmartToolX",
    description:
      "Switch text to UPPERCASE, lowercase, Title Case, or sentence case. Paste a draft and copy the result.",
    keywords:
      "case converter, uppercase converter, title case converter, lowercase text, sentence case",
    focusKeyword: "case converter",
  },
  "password-generator": {
    title: "Free Password Generator Online | SmartToolX",
    description:
      "Create a random password in your browser. Length and character options stay on your device. Nothing is stored.",
    keywords:
      "password generator, random password, strong password generator, secure password online",
    focusKeyword: "password generator",
  },
  "lorem-ipsum-generator": {
    title: "Free Lorem Ipsum Generator | SmartToolX",
    description:
      "Generate placeholder paragraphs for layouts and drafts. Choose how much dummy text you need and copy it.",
    keywords:
      "lorem ipsum generator, dummy text generator, placeholder text, lorem ipsum online",
    focusKeyword: "lorem ipsum generator",
  },
  "text-reverser": {
    title: "Free Reverse Text Tool Online | SmartToolX",
    description:
      "Reverse characters or words in any block of text. Useful for puzzles, checks, and quick edits.",
    keywords:
      "reverse text, backwards text generator, reverse letters, reverse words online",
    focusKeyword: "reverse text",
  },
  "base64-encoder": {
    title: "Free Base64 Encoder and Decoder | SmartToolX",
    description:
      "Encode or decode Base64 text in your browser. Handy for tokens, data URLs, and debugging.",
    keywords:
      "Base64 encoder, Base64 decoder, encode Base64, decode Base64 online",
    focusKeyword: "Base64 encoder",
  },
  "slug-generator": {
    title: "Free URL Slug Generator Online | SmartToolX",
    description:
      "Turn a title into a URL-safe slug for blogs and pages. Lowercase, hyphenated, and ready to paste.",
    keywords:
      "slug generator, URL slug, permalink generator, SEO slug, title to slug",
    focusKeyword: "slug generator",
  },
  "temperature-converter": {
    title: "Free Temperature Converter Online | SmartToolX",
    description:
      "Convert Celsius, Fahrenheit, and Kelvin in one place. Built for cooking, weather, and science homework.",
    keywords:
      "temperature converter, Celsius to Fahrenheit, Fahrenheit to Celsius, Kelvin converter",
    focusKeyword: "temperature converter",
  },
  "number-to-words": {
    title: "Free Number to Words Converter | SmartToolX",
    description:
      "Spell out any number in English words. Useful for cheques, invoices, and writing amounts in text.",
    keywords:
      "number to words, numbers to words converter, amount in words, cheque amount in words",
    focusKeyword: "number to words",
  },
  "binary-converter": {
    title: "Free Binary Converter Online | SmartToolX",
    description:
      "Convert between decimal, binary, and hexadecimal. Enter a value and see the other bases at once.",
    keywords:
      "binary converter, decimal to binary, hex converter, binary to decimal calculator",
    focusKeyword: "binary converter",
  },
  "color-converter": {
    title: "Free HEX to RGB Color Converter | SmartToolX",
    description:
      "Convert HEX colors to RGB and back. Paste a code and copy the matching format for CSS or design tools.",
    keywords:
      "HEX to RGB, RGB to HEX, color converter, hex color picker converter",
    focusKeyword: "color converter",
  },
  "roman-numeral-converter": {
    title: "Free Roman Numeral Converter | SmartToolX",
    description:
      "Convert numbers from 1 to 3999 into Roman numerals. Built for dates, outlines, and clock faces.",
    keywords:
      "Roman numeral converter, numbers to Roman numerals, Roman numerals calculator",
    focusKeyword: "Roman numeral converter",
  },
  "time-calculator": {
    title: "Free Time Calculator Online | SmartToolX",
    description:
      "Add hours, minutes, and seconds into a total time. Useful for logs, workouts, and video lengths.",
    keywords:
      "time calculator, add hours minutes seconds, duration calculator, time adder",
    focusKeyword: "time calculator",
  },
  "date-difference-calculator": {
    title: "Free Date Difference Calculator | SmartToolX",
    description:
      "Find years, months, weeks, and total days between two dates. Use it for timelines, leave, and event planning.",
    keywords:
      "date difference calculator, days between two dates, date duration calculator, how many days between dates",
    focusKeyword: "date difference calculator",
  },
  "pdf-to-word": {
    title: "Free PDF to Word Converter Online | SmartToolX",
    description:
      "Convert a PDF into an editable Word document in your browser. Text is extracted on your device. Files are not uploaded.",
    keywords:
      "PDF to Word, PDF to DOCX, convert PDF to Word online free, PDF to Word converter",
    focusKeyword: "PDF to Word converter",
  },
  "word-to-pdf": {
    title: "Free Word to PDF Converter Online | SmartToolX",
    description:
      "Turn a .docx file into a PDF you can send or print. Conversion runs in your browser with no account.",
    keywords:
      "Word to PDF, DOCX to PDF, convert Word to PDF online free, Word to PDF converter",
    focusKeyword: "Word to PDF converter",
  },
  "pdf-to-jpg": {
    title: "Free PDF to JPG Converter Online | SmartToolX",
    description:
      "Export each PDF page as a JPG. Multi-page files download as a zip. Conversion stays in your browser.",
    keywords:
      "PDF to JPG, PDF to JPEG, convert PDF pages to images, PDF to JPG converter",
    focusKeyword: "PDF to JPG converter",
  },
  "jpg-to-pdf": {
    title: "Free JPG to PDF Converter Online | SmartToolX",
    description:
      "Combine one or more JPG or PNG images into a single PDF. Page order follows your upload order.",
    keywords:
      "JPG to PDF, images to PDF, convert photos to PDF, JPEG to PDF converter",
    focusKeyword: "JPG to PDF converter",
  },
  "excel-to-pdf": {
    title: "Free Excel to PDF Converter Online | SmartToolX",
    description:
      "Convert .xlsx or CSV spreadsheets into a print-ready PDF. Cell values are laid out as readable text.",
    keywords:
      "Excel to PDF, XLSX to PDF, convert spreadsheet to PDF, Excel to PDF converter",
    focusKeyword: "Excel to PDF converter",
  },
  "ppt-to-pdf": {
    title: "Free PPT to PDF Converter Online | SmartToolX",
    description:
      "Convert PowerPoint decks (.ppt or .pptx) into a shareable PDF. Slides are processed in your browser.",
    keywords:
      "PPT to PDF, PPTX to PDF, PowerPoint to PDF, convert slides to PDF",
    focusKeyword: "PPT to PDF converter",
  },
  "compress-pdf": {
    title: "Free Compress PDF Online | SmartToolX",
    description:
      "Shrink a PDF for email and uploads. Compression runs in your browser so the file is not sent to a server.",
    keywords:
      "compress PDF, reduce PDF size, compress PDF online free, PDF compressor",
    focusKeyword: "compress PDF",
  },
  "merge-pdf": {
    title: "Free Merge PDF Online | SmartToolX",
    description:
      "Combine multiple PDFs into one document. Add files in the order you want, then download a single PDF.",
    keywords:
      "merge PDF, combine PDF, join PDF files, merge PDF online free",
    focusKeyword: "merge PDF",
  },
  "pdf-to-png": {
    title: "Free PDF to PNG Converter Online | SmartToolX",
    description:
      "Export each PDF page as a PNG. Sharp edges stay useful for slides and screenshots. Multi-page files zip together.",
    keywords:
      "PDF to PNG, convert PDF to PNG, PDF page to image, PDF to PNG converter",
    focusKeyword: "PDF to PNG converter",
  },
  "png-to-pdf": {
    title: "Free PNG to PDF Converter Online | SmartToolX",
    description:
      "Combine one or more PNG images into a single PDF. Each image becomes its own page at original size.",
    keywords:
      "PNG to PDF, convert PNG to PDF, images to PDF, PNG to PDF converter",
    focusKeyword: "PNG to PDF converter",
  },
};

const pageSeo: Record<string, SeoEntry> = {
  "/": seo(
    "/",
    "Home",
    "Free Online Calculators and Converters | SmartToolX",
    "Free calculators, converters, and file tools that run in your browser. BMI, EMI, currency, word count, PDF tools, and more. No account needed.",
    {
      keywords:
        "free online calculators, BMI calculator, EMI calculator, calorie calculator, GST calculator, unit converter, word counter, PDF converter, SmartToolX",
      h1: "Every number you need, solved in .04s",
      focusKeyword: "free online calculators",
      schemaType: "WebSite",
    },
  ),
  "/tools": seo(
    "/tools",
    "All Tools",
    "All Free Tools | SmartToolX",
    "Browse every SmartToolX calculator, converter, text tool, and file converter. Each one runs in your browser.",
    {
      keywords:
        "all tools, free online tools, calculator list, PDF converter list, SmartToolX tools",
      focusKeyword: "free online tools",
    },
  ),
  "/calculators": seo(
    "/calculators",
    "Calculators",
    "Free Online Calculators | SmartToolX",
    "Health and finance calculators for BMI, EMI, calories, GST, SIP, and more. Open a tool, enter numbers, and see the result.",
    {
      keywords:
        "online calculators, BMI calculator, EMI calculator, age calculator, percentage calculator, calorie calculator",
      focusKeyword: "online calculators",
    },
  ),
  "/converters": seo(
    "/converters",
    "Converters",
    "Free Online Converters | SmartToolX",
    "Convert currency, units, temperature, colors, and more without leaving the page. Live rates for money, standard factors for the rest.",
    {
      keywords:
        "unit converter, currency converter, temperature converter, live exchange rates, binary converter",
      focusKeyword: "unit converter",
    },
  ),
  "/text-tools": seo(
    "/text-tools",
    "Text Tools",
    "Free Text Tools Online | SmartToolX",
    "Count words, generate passwords and QR codes, change case, and build URL slugs. Paste text and copy the result.",
    {
      keywords:
        "word counter, QR code generator, password generator, case converter, slug generator, text tools",
      focusKeyword: "text tools",
    },
  ),
  "/finance": seo(
    "/finance",
    "Finance",
    "Free Finance Calculators | SmartToolX",
    "EMI, GST, SIP, compound interest, tips, discounts, and live currency conversion for everyday money decisions.",
    {
      keywords:
        "loan EMI calculator, GST calculator, SIP calculator, percentage calculator, currency converter, finance calculator",
      focusKeyword: "finance calculator",
    },
  ),
  "/file-converter": seo(
    "/file-converter",
    "File Converter",
    "Free File Converter Tools | SmartToolX",
    "Convert PDF, Word, Excel, PowerPoint, and images in your browser. Compress and merge PDFs without uploading files.",
    {
      keywords:
        "PDF to Word, Word to PDF, PPT to PDF, Excel to PDF, compress PDF, merge PDF, file converter",
      focusKeyword: "file converter",
    },
  ),
  "/about": seo(
    "/about",
    "About",
    "About SmartToolX | Free Browser Tools",
    "SmartToolX is a free toolkit of calculators, converters, and file tools. Work stays in your browser. No account required.",
    {
      keywords: "about SmartToolX, free calculator website, browser tools",
      focusKeyword: "about SmartToolX",
      schemaType: "AboutPage",
    },
  ),
  "/contact": seo(
    "/contact",
    "Contact",
    "Contact SmartToolX",
    "Questions, corrections, or a tool you want added? Send a note to the SmartToolX team.",
    {
      keywords: "contact SmartToolX, calculator support, request a tool",
      focusKeyword: "contact SmartToolX",
      schemaType: "ContactPage",
    },
  ),
  "/privacy": seo(
    "/privacy",
    "Privacy Policy",
    "Privacy Policy | SmartToolX",
    "How SmartToolX handles your data. Most tools calculate locally in your browser and do not store the numbers you type.",
    {
      keywords: "privacy policy, data protection, SmartToolX privacy",
      focusKeyword: "privacy policy",
    },
  ),
  "/terms": seo(
    "/terms",
    "Terms and Conditions",
    "Terms and Conditions | SmartToolX",
    "Terms of use for SmartToolX calculators, converters, and file tools. Results are for information only.",
    {
      keywords: "terms and conditions, terms of use, SmartToolX",
      focusKeyword: "terms and conditions",
    },
  ),
  "/social": seo(
    "/social",
    "Social Media",
    "SmartToolX on Social Media",
    "Find SmartToolX on Facebook, X, Instagram, LinkedIn, YouTube, and more for new tools and updates.",
    {
      keywords:
        "SmartToolX social media, Facebook, Twitter, Instagram, LinkedIn, YouTube",
      focusKeyword: "SmartToolX social media",
    },
  ),
  "/admin": seo(
    "/admin",
    "Admin dashboard",
    "Admin Dashboard | SmartToolX",
    "Sign in to edit SEO, social links, privacy, and terms for SmartToolX.",
    { ...hidden, keywords: "SmartToolX admin", focusKeyword: "admin dashboard" },
  ),
  "/admin/login": seo(
    "/admin/login",
    "Admin login",
    "Admin Login | SmartToolX",
    "Log in to the SmartToolX admin dashboard.",
    { ...hidden, keywords: "SmartToolX admin login", focusKeyword: "admin login" },
  ),
  "/admin/seo": seo(
    "/admin/seo",
    "SEO pages",
    "SEO Pages | SmartToolX Admin",
    "Edit title, description, keywords, canonical, Open Graph, and Twitter fields for every page.",
    { ...hidden, keywords: "SmartToolX SEO admin", focusKeyword: "SEO pages" },
  ),
  "/admin/social": seo(
    "/admin/social",
    "Social media admin",
    "Social Links | SmartToolX Admin",
    "Edit public social profile URLs for SmartToolX.",
    {
      ...hidden,
      keywords: "SmartToolX social admin",
      focusKeyword: "social media admin",
    },
  ),
  "/admin/privacy": seo(
    "/admin/privacy",
    "Privacy policy admin",
    "Privacy Policy Editor | SmartToolX Admin",
    "Edit the public privacy policy.",
    {
      ...hidden,
      keywords: "SmartToolX privacy admin",
      focusKeyword: "privacy policy admin",
    },
  ),
  "/admin/terms": seo(
    "/admin/terms",
    "Terms admin",
    "Terms Editor | SmartToolX Admin",
    "Edit the public terms and conditions.",
    { ...hidden, keywords: "SmartToolX terms admin", focusKeyword: "terms admin" },
  ),
};

for (const tool of tools) {
  const path = `/tools/${tool.slug}`;
  const extra = TOOL_SEO[tool.slug];
  pageSeo[path] = seo(
    path,
    tool.name,
    extra?.title ?? `Free ${tool.name} | SmartToolX`,
    extra?.description ?? tool.description,
    {
      keywords:
        extra?.keywords ??
        `${tool.name}, free ${tool.name.toLowerCase()} online, ${tool.category}, SmartToolX`,
      h1: tool.name,
      focusKeyword: extra?.focusKeyword ?? tool.name.toLowerCase(),
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
