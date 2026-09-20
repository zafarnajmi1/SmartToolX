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
    title: "Percentage Calculator Online Free | SmartToolX",
    description:
      "Free percentage calculator online. Find what is X percent of Y, plus the increased total. Use it for discounts, marks, tips, and tax.",
    keywords:
      "percentage calculator, percentage calculator online, what is x percent of y, free percentage calculator, percent increase calculator",
    focusKeyword: "percentage calculator",
  },
  "bmi-calculator": {
    title: "BMI Calculator Online Free | SmartToolX",
    description:
      "Free BMI calculator online. Enter height and weight in cm, feet, kg, lb, or stone. See your body mass index and WHO category instantly.",
    keywords:
      "BMI calculator, free BMI calculator online, BMI calculator online, body mass index calculator, BMI chart",
    focusKeyword: "BMI calculator",
  },
  "loan-emi-calculator": {
    title: "EMI Calculator Online Free | SmartToolX",
    description:
      "Free loan EMI calculator online. See monthly EMI, total interest, and amount payable for home, car, or personal loans.",
    keywords:
      "EMI calculator, loan EMI calculator, EMI calculator online, home loan EMI calculator, monthly loan payment",
    focusKeyword: "EMI calculator",
  },
  "word-counter": {
    title: "Word Counter Online Free | SmartToolX",
    description:
      "Free word counter online. Count words, characters, and reading time as you type. No upload and no account.",
    keywords:
      "word counter, word counter online, word count tool, character counter, free word counter online",
    focusKeyword: "word counter",
  },
  "currency-converter": {
    title: "Currency Converter Live Rates | SmartToolX",
    description:
      "Free live currency converter. Convert USD, EUR, GBP, INR, and 150+ currencies with mid-market rates that refresh about once a minute.",
    keywords:
      "currency converter, live currency converter, currency converter online, USD to INR, EUR to USD",
    focusKeyword: "currency converter",
  },
  "age-calculator": {
    title: "Age Calculator Online Free | SmartToolX",
    description:
      "Free age calculator online. Find exact age in years, months, and days from a date of birth.",
    keywords:
      "age calculator, age calculator online, exact age calculator, age in years months days, date of birth calculator",
    focusKeyword: "age calculator",
  },
  "qr-code-generator": {
    title: "QR Code Generator Free Online | SmartToolX",
    description:
      "Free QR code generator online. Turn a link or text into a scannable QR code and download the image. No signup.",
    keywords:
      "QR code generator, free QR code generator, QR code generator online, create QR code from URL, QR maker",
    focusKeyword: "QR code generator",
  },
  "unit-converter": {
    title: "Unit Converter Online Free | SmartToolX",
    description:
      "Free unit converter online. Convert km to miles, kg to lbs, cm to inches, temperature, and more instantly.",
    keywords:
      "unit converter, unit converter online, km to miles, kg to lbs, free unit converter online",
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
  "period-calculator": {
    title: "Period Calculator Online Free | SmartToolX",
    description:
      "Free period calculator online. Estimate next period dates from the first day of your last period and cycle length.",
    keywords:
      "period calculator, period calculator online, next period calculator, menstrual cycle calculator, period tracker calculator",
    focusKeyword: "period calculator",
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
    title: "GST Calculator Online Free | SmartToolX",
    description:
      "Free GST calculator online. Add or remove GST or VAT from any amount and see the tax plus the net or gross total.",
    keywords:
      "GST calculator, GST calculator online, VAT calculator, add GST, remove GST",
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
    title: "SIP Calculator Online Free | SmartToolX",
    description:
      "Free SIP calculator online. Estimate mutual fund SIP maturity from monthly amount, expected return, and years.",
    keywords:
      "SIP calculator, SIP calculator online, systematic investment plan calculator, mutual fund SIP calculator",
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
  "fd-calculator": {
    title: "FD Calculator Online Free | SmartToolX",
    description:
      "Free FD calculator online. Estimate fixed deposit maturity and interest from amount, annual rate, and tenure in years.",
    keywords:
      "FD calculator, fixed deposit calculator, FD calculator online, FD maturity calculator, bank FD calculator",
    focusKeyword: "FD calculator",
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
  "json-formatter": {
    title: "JSON Formatter Online Free | SmartToolX",
    description:
      "Free JSON formatter online. Beautify or minify JSON in your browser. No upload and no account.",
    keywords:
      "JSON formatter, JSON beautifier, JSON formatter online, minify JSON, format JSON",
    focusKeyword: "JSON formatter",
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
  "time-zone-converter": {
    title: "Time Zone Converter Online Free | SmartToolX",
    description:
      "Free time zone converter online. Convert a date and time between all IANA time zones, including UTC, Pakistan, India, US, and UK.",
    keywords:
      "time zone converter, timezone converter, time zone converter online, convert time zones, UTC converter",
    focusKeyword: "time zone converter",
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Free Online | SmartToolX",
    description:
      "Convert PDF to Word online free. No signup. Your file stays in the browser. Download an editable DOCX in seconds.",
    keywords:
      "PDF to Word, PDF to Word converter, PDF to Word online free, convert PDF to Word, PDF to DOCX",
    focusKeyword: "PDF to Word converter",
  },
  "word-to-pdf": {
    title: "Word to PDF Converter Free Online | SmartToolX",
    description:
      "Convert Word to PDF online free. Drop a DOCX file and download a PDF. No account. Conversion runs in your browser.",
    keywords:
      "Word to PDF, Word to PDF converter, Word to PDF online free, DOCX to PDF, convert Word to PDF",
    focusKeyword: "Word to PDF converter",
  },
  "pdf-to-jpg": {
    title: "PDF to JPG Converter Free Online | SmartToolX",
    description:
      "Convert PDF to JPG online free. Export every page as a JPEG. Multi-page files download as a zip. No upload to a server.",
    keywords:
      "PDF to JPG, PDF to JPG converter, PDF to JPEG online free, convert PDF to JPG, PDF to image",
    focusKeyword: "PDF to JPG converter",
  },
  "jpg-to-pdf": {
    title: "JPG to PDF Converter Free Online | SmartToolX",
    description:
      "Convert JPG to PDF online free. Combine photos or PNG images into one PDF. No signup. Files stay on your device.",
    keywords:
      "JPG to PDF, JPG to PDF converter, convert image to PDF free, JPEG to PDF, images to PDF",
    focusKeyword: "JPG to PDF converter",
  },
  "excel-to-pdf": {
    title: "Excel to PDF Converter Free Online | SmartToolX",
    description:
      "Convert Excel to PDF online free. Turn XLSX or CSV into a print-ready PDF in your browser. No account needed.",
    keywords:
      "Excel to PDF, Excel to PDF converter, XLSX to PDF online free, convert spreadsheet to PDF",
    focusKeyword: "Excel to PDF converter",
  },
  "ppt-to-pdf": {
    title: "PPT to PDF Converter Free Online | SmartToolX",
    description:
      "Convert PPT to PDF online free. Upload a PowerPoint .ppt or .pptx file and download a shareable PDF. No signup.",
    keywords:
      "PPT to PDF, PPT to PDF converter, PowerPoint to PDF online free, PPTX to PDF, convert slides to PDF",
    focusKeyword: "PPT to PDF converter",
  },
  "compress-pdf": {
    title: "Compress PDF Online Free | SmartToolX",
    description:
      "Compress PDF online free. Reduce PDF file size for email and uploads. Runs in your browser. Files are not uploaded.",
    keywords:
      "compress PDF, compress PDF online, compress PDF online free, reduce PDF size, PDF compressor",
    focusKeyword: "compress PDF online",
  },
  "merge-pdf": {
    title: "Merge PDF Online Free | SmartToolX",
    description:
      "Merge PDF files online free. Combine multiple PDFs into one document in your browser. No signup and no upload.",
    keywords:
      "merge PDF, merge PDF online, combine PDF online free, join PDF files, merge PDF free",
    focusKeyword: "merge PDF",
  },
  "pdf-to-png": {
    title: "PDF to PNG Converter Free Online | SmartToolX",
    description:
      "Convert PDF to PNG online free. Export each page as a sharp PNG. Multi-page files download as a zip.",
    keywords:
      "PDF to PNG, PDF to PNG converter, PDF to PNG online free, convert PDF to PNG, PDF page to image",
    focusKeyword: "PDF to PNG converter",
  },
  "png-to-pdf": {
    title: "PNG to PDF Converter Free Online | SmartToolX",
    description:
      "Convert PNG to PDF online free. Combine one or more PNG images into a single PDF. No account needed.",
    keywords:
      "PNG to PDF, PNG to PDF converter, convert PNG to PDF free, images to PDF, PNG to PDF online",
    focusKeyword: "PNG to PDF converter",
  },
  "split-pdf": {
    title: "Split PDF Online Free | SmartToolX",
    description:
      "Split PDF online free. Turn each page into its own PDF. Multi-page files download as a zip. No signup.",
    keywords:
      "split PDF, split PDF online, split PDF online free, extract PDF pages, split PDF pages",
    focusKeyword: "split PDF",
  },
  "sleep-calculator": {
    title: "Sleep Calculator Online Free | Bedtime & Wake Time",
    description:
      "Free sleep calculator online. Find the best bedtime or wake-up time from 90-minute sleep cycles. No account needed.",
    keywords:
      "sleep calculator, bedtime calculator, sleep cycle calculator, wake up calculator, when should I go to bed, sleep time calculator, sleep calculator online",
    focusKeyword: "sleep calculator",
  },
  "mortgage-calculator": {
    title: "Mortgage Calculator Online Free | Monthly Payment",
    description:
      "Free mortgage calculator online. See monthly payment, total interest, and amount payable from home price, down payment, rate, and term.",
    keywords:
      "mortgage calculator, mortgage payment calculator, home loan calculator, monthly mortgage payment, mortgage calculator with down payment, house payment calculator, mortgage calculator online",
    focusKeyword: "mortgage calculator",
  },
  "random-number-generator": {
    title: "Random Number Generator Online Free | 1 to 100",
    description:
      "Free random number generator online. Pick random numbers between any minimum and maximum, including 1 to 100. No signup.",
    keywords:
      "random number generator, random number generator 1-100, number generator, random number picker, RNG online, generate random numbers, random number generator online",
    focusKeyword: "random number generator",
  },
  "gpa-calculator": {
    title: "GPA Calculator Online Free | CGPA to Percentage",
    description:
      "Free GPA calculator online. Find GPA from credits, convert percentage to 4.0 GPA, and convert CGPA to percentage.",
    keywords:
      "GPA calculator, GPA calculator online, CGPA calculator, CGPA to percentage, college GPA calculator, GPA calculator 4.0, grade point average calculator, percentage to CGPA",
    focusKeyword: "GPA calculator",
  },
  "png-to-jpg": {
    title: "PNG to JPG Converter Free Online | SmartToolX",
    description:
      "Convert PNG to JPG online free. Turn PNG images into JPEG in your browser. No signup. Files are not uploaded.",
    keywords:
      "PNG to JPG, PNG to JPG converter, convert PNG to JPG, PNG to JPEG online free, PNG to JPG online, convert PNG to JPEG, PNG to JPG converter free",
    focusKeyword: "PNG to JPG converter",
  },
};

const pageSeo: Record<string, SeoEntry> = {
  "/": seo(
    "/",
    "Home",
    "Free Online Calculators and PDF Converter | SmartToolX",
    "Free online calculators and a free PDF converter in your browser. Sleep calculator, mortgage calculator, GPA calculator, PNG to JPG, period calculator, BMI, EMI, and more. No account needed.",
    {
      keywords:
        "sleep calculator, mortgage calculator, GPA calculator, random number generator, PNG to JPG, free online calculator, free PDF converter, BMI calculator, EMI calculator, SmartToolX",
      h1: "Free online calculators and PDF converter",
      focusKeyword: "free online calculators",
      schemaType: "WebSite",
    },
  ),
  "/tools": seo(
    "/tools",
    "All Tools",
    "All Free Tools | SmartToolX",
    "Browse every SmartToolX calculator, converter, text tool, and file converter. Sleep calculator, mortgage, GPA, random numbers, PNG to JPG, and more. Each one runs in your browser.",
    {
      keywords:
        "sleep calculator, mortgage calculator, GPA calculator, random number generator, PNG to JPG, all tools, free online tools, calculator list, PDF converter list, SmartToolX tools",
      focusKeyword: "free online tools",
    },
  ),
  "/calculators": seo(
    "/calculators",
    "Calculators",
    "Free Online Calculators | SmartToolX",
    "Health and finance calculators for sleep, mortgage, period dates, BMI, EMI, GPA, FD, GST, SIP, calories, and more. Open a tool, enter numbers, and see the result.",
    {
      keywords:
        "sleep calculator, mortgage calculator, GPA calculator, online calculators, period calculator, BMI calculator, EMI calculator, FD calculator, calorie calculator",
      focusKeyword: "online calculators",
    },
  ),
  "/converters": seo(
    "/converters",
    "Converters",
    "Free Online Converters | SmartToolX",
    "Convert currency, units, temperature, time zones, GPA, colors, and more without leaving the page. Live rates for money, standard factors for the rest.",
    {
      keywords:
        "GPA calculator, CGPA to percentage, unit converter, currency converter, time zone converter, temperature converter, live exchange rates, binary converter",
      focusKeyword: "unit converter",
    },
  ),
  "/text-tools": seo(
    "/text-tools",
    "Text Tools",
    "Free Text Tools Online | SmartToolX",
    "Count words, format JSON, generate random numbers, passwords, and QR codes, change case, and build URL slugs. Paste text and copy the result.",
    {
      keywords:
        "random number generator, JSON formatter, word counter, QR code generator, password generator, case converter, slug generator, text tools",
      focusKeyword: "text tools",
    },
  ),
  "/finance": seo(
    "/finance",
    "Finance",
    "Free Finance Calculators | SmartToolX",
    "Mortgage, EMI, FD, GST, SIP, compound interest, tips, discounts, and live currency conversion for everyday money decisions.",
    {
      keywords:
        "mortgage calculator, loan EMI calculator, FD calculator, GST calculator, SIP calculator, percentage calculator, currency converter, finance calculator",
      focusKeyword: "finance calculator",
    },
  ),
  "/file-converter": seo(
    "/file-converter",
    "File Converter",
    "Free PDF Converter Online | SmartToolX",
    "Free PDF converter online. PDF to Word, Word to PDF, compress PDF, merge PDF, split PDF, PNG to JPG, JPG to PDF, and PPT to PDF. No signup. Files stay in your browser.",
    {
      keywords:
        "PNG to JPG, free PDF converter, PDF to Word online free, compress PDF online, merge PDF, split PDF, Word to PDF, PPT to PDF, file converter",
      focusKeyword: "free PDF converter",
      h1: "Free PDF Converter Online",
    },
  ),
  "/about": seo(
    "/about",
    "About Us",
    "About Us | SmartToolX",
    "About SmartToolX. Free calculators, converters, and file tools that run in your browser. No account required.",
    {
      keywords: "about us, about SmartToolX, free online tools, browser calculators",
      focusKeyword: "about us",
      h1: "About Us",
      schemaType: "AboutPage",
    },
  ),
  "/contact": seo(
    "/contact",
    "Contact Us",
    "Contact Us | SmartToolX",
    "Contact SmartToolX for questions, corrections, or to request a new calculator or converter.",
    {
      keywords: "contact us, contact SmartToolX, calculator support, request a tool",
      focusKeyword: "contact us",
      h1: "Contact Us",
      schemaType: "ContactPage",
    },
  ),
  "/privacy": seo(
    "/privacy",
    "Privacy Policy",
    "Privacy Policy | SmartToolX",
    "Read the SmartToolX privacy policy. Learn what data we collect, how tools run in your browser, and how cookies may be used.",
    {
      keywords: "privacy policy, SmartToolX privacy policy, data protection, cookies",
      focusKeyword: "privacy policy",
      h1: "Privacy Policy",
    },
  ),
  "/terms": seo(
    "/terms",
    "Terms and Conditions",
    "Terms and Conditions | SmartToolX",
    "Read the SmartToolX terms and conditions for free calculators, converters, and file tools. Results are for information only.",
    {
      keywords: "terms and conditions, terms of use, SmartToolX terms",
      focusKeyword: "terms and conditions",
      h1: "Terms and Conditions",
    },
  ),
  "/social": seo(
    "/social",
    "Social Media",
    "SmartToolX on Social Media",
    "Find SmartToolX on Facebook, X, Instagram, LinkedIn, YouTube, and more for new tools and updates.",
    {
      ...hidden,
      robotsFollow: true,
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
  "/admin/messages": seo(
    "/admin/messages",
    "Messages admin",
    "Messages | SmartToolX Admin",
    "Read contact form submissions.",
    {
      ...hidden,
      keywords: "SmartToolX messages admin",
      focusKeyword: "messages admin",
    },
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
    title: "Privacy Policy",
    description:
      "How SmartToolX handles your data. Most tools run in your browser. We do not require an account to use the site.",
    lastUpdated: "September 13, 2026",
    content: `## Who we are

SmartToolX (smarttoolx.com) is a free website of calculators, converters, text tools, and file tools. You can use the site without creating an account.

## Information we collect

Most tools run in your browser. Numbers you type into a calculator, text you paste into a text tool, and files you convert stay on your device. We do not store those inputs on our servers.

If you send a message through the Contact Us page, we use the name, email address, and message you provide only to reply to you. We do not sell this information.

Some tools need a short network request to work. Examples include live currency rates and QR code image generation. Those requests send only what the tool needs to return a result.

## Cookies and analytics

We may use basic analytics cookies or similar tools to understand which pages are used and to keep the site working. These reports help us improve SmartToolX. They are not sold as a personal profile.

## Advertising

We may show ads on SmartToolX through Google AdSense or a similar partner. Advertising partners may use cookies and device identifiers to show ads, measure how ads perform, and limit how often you see the same ad. Google explains this in its Privacy Policy and Ad Settings.

You can control cookies in your browser settings. Blocking cookies may affect some site features.

## Files and generated content

File converters process files in your browser. We do not keep a copy of those files on a server after you leave the page. You are responsible for the files you choose to convert.

## Children

SmartToolX is not directed at children under 13. We do not knowingly collect personal information from children.

## How long we keep data

Contact messages are kept only as long as needed to reply and handle the request. Browser-side calculations are not stored by us.

## Your choices

You can stop using the site at any time. You can clear cookies in your browser. To ask a question about this policy, use the Contact Us page.

## Changes

We may update this privacy policy as the site grows. The date at the top of this page shows the latest revision.`,
  },
  terms: {
    title: "Terms and Conditions",
    description:
      "By using SmartToolX you agree to these terms. Tools are free, run in your browser, and are for informational use only.",
    lastUpdated: "September 13, 2026",
    content: `## Agreement

By accessing or using SmartToolX you agree to these terms. If you do not agree, do not use the site.

## The service

SmartToolX provides free calculators, converters, text tools, and file tools at smarttoolx.com. Results are for informational purposes only. They are not professional, medical, financial, or legal advice. Always verify important numbers independently.

## Using the tools

You may use the tools for personal or commercial purposes. You must not scrape, overload, or attempt to disrupt the service, or present the site as your own.

You are responsible for files and text you enter. Do not convert or process content you do not have the right to use.

## How processing works

Most calculations and file conversions run in your browser. A few tools need a network request, such as live currency rates or QR image generation. We do not guarantee uninterrupted availability or error-free results.

## Intellectual property

SmartToolX, the logo, and the site design are the property of SmartToolX. You may not copy the brand or design for a competing service.

## Disclaimer

The tools are provided as is. To the fullest extent allowed by law, SmartToolX is not liable for losses arising from use of the tools or inability to use the site.

## Changes

We may change tools, these terms, or the site at any time. Continued use after a change means you accept the updated terms.

## Contact

Questions about these terms can be sent through the Contact Us page.`,
  },
  seo: pageSeo,
};

export const SEO_PAGE_LIST = Object.values(pageSeo).map((entry) => ({
  path: entry.path,
  name: entry.name,
}));
