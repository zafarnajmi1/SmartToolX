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
    title: "Percentage Calculator Free | Calculate Percentage Online",
    description:
      "Calculate Percentage free. This percentage calculator free finds what is X percent of Y as you type. Percentage Calculator Online free — no software and no signup.",
    keywords:
      "percentage calculator free, calculate percentage free, percentage calculator online free, calculate percentage, percentage calculator",
    focusKeyword: "percentage calculator free",
  },
  "bmi-calculator": {
    title: "BMI Calculator Free | Check BMI Online",
    description:
      "Check BMI free. This bmi calculator free checks body mass index from height and weight. BMI Calculator Online free — no software and no signup.",
    keywords:
      "bmi calculator free, check bmi free, bmi calculator online free, check bmi, bmi calculator",
    focusKeyword: "bmi calculator free",
  },
  "loan-emi-calculator": {
    title: "EMI Calculator Free | Calculate Loan EMI Online",
    description:
      "Calculate Loan EMI free. This emi calculator free shows monthly EMI, total interest, and amount payable. Loan EMI Calculator free — no software and no signup.",
    keywords:
      "emi calculator free, calculate loan emi free, loan emi calculator free, calculate loan emi, emi calculator",
    focusKeyword: "emi calculator free",
  },
  "word-counter": {
    title: "Word Counter Free | Count Words Online",
    description:
      "Count Words free. This word counter free counts words, characters, and reading time as you type. Word Counter Online free — no software and no signup.",
    keywords:
      "word counter free, count words free, word counter online free, count words, word counter",
    focusKeyword: "word counter free",
  },
  "currency-converter": {
    title: "Currency Converter Free | Convert Currency Online",
    description:
      "Convert Currency free. This currency converter free converts USD, EUR, GBP, INR, and 150+ currencies. Live Currency Converter free — no software and no signup.",
    keywords:
      "currency converter free, convert currency free, live currency converter free, convert currency, currency converter",
    focusKeyword: "currency converter free",
  },
  "age-calculator": {
    title: "Age Calculator Free | Calculate Age Online",
    description:
      "Calculate Age free. This age calculator free finds exact age in years, months, and days. Age Calculator Online free — no software and no signup.",
    keywords:
      "age calculator free, calculate age free, age calculator online free, calculate age, age calculator",
    focusKeyword: "age calculator free",
  },
  "qr-code-generator": {
    title: "QR Code Generator Free | Create QR Code Online",
    description:
      "Create QR Code free. This qr code generator free turns a link or text into a downloadable QR image. QR Code Generator Online free — no software and no signup.",
    keywords:
      "qr code generator free, create qr code free, qr code generator online free, create qr code, qr code generator",
    focusKeyword: "qr code generator free",
  },
  "unit-converter": {
    title: "Unit Converter Free | Convert Units Online",
    description:
      "Convert Units free. This unit converter free converts km to miles, kg to lbs, and more. Unit Converter Online free — no software and no signup.",
    keywords:
      "unit converter free, convert units free, unit converter online free, convert units, unit converter",
    focusKeyword: "unit converter free",
  },
  "calorie-calculator": {
    title: "Calorie Calculator Free | Calculate Calories Online",
    description:
      "Calculate Calories free. This calorie calculator free estimates daily calories from age, height, weight, and activity. Calorie Calculator Online free — no software and no signup.",
    keywords:
      "calorie calculator free, calculate calories free, calorie calculator online free, calculate calories, calorie calculator",
    focusKeyword: "calorie calculator free",
  },
  "bmr-calculator": {
    title: "BMR Calculator Free | Calculate BMR Online",
    description:
      "Calculate BMR free. This bmr calculator free finds basal metabolic rate from age, sex, height, and weight. BMR Calculator Online free — no software and no signup.",
    keywords:
      "bmr calculator free, calculate bmr free, bmr calculator online free, calculate bmr, bmr calculator",
    focusKeyword: "bmr calculator free",
  },
  "body-fat-calculator": {
    title: "Body Fat Calculator Free | Calculate Body Fat Online",
    description:
      "Calculate Body Fat free. This body fat calculator free estimates body fat percentage from BMI, age, and sex. Body Fat Percentage Calculator free — no software and no signup.",
    keywords:
      "body fat calculator free, calculate body fat free, body fat percentage calculator free, calculate body fat, body fat calculator",
    focusKeyword: "body fat calculator free",
  },
  "pregnancy-due-date-calculator": {
    title: "Due Date Calculator Free | Calculate Due Date Online",
    description:
      "Calculate Due Date free. This due date calculator free estimates due date from the first day of your last period. Pregnancy Due Date Calculator free — no software and no signup.",
    keywords:
      "due date calculator free, calculate due date free, pregnancy due date calculator free, calculate due date, due date calculator",
    focusKeyword: "due date calculator free",
  },
  "ovulation-calculator": {
    title: "Ovulation Calculator Free | Calculate Ovulation Online",
    description:
      "Calculate Ovulation free. This ovulation calculator free estimates ovulation day and the fertile window. Ovulation Calculator Online free — no software and no signup.",
    keywords:
      "ovulation calculator free, calculate ovulation free, ovulation calculator online free, calculate ovulation, ovulation calculator",
    focusKeyword: "ovulation calculator free",
  },
  "water-intake-calculator": {
    title: "Water Intake Calculator Free | Calculate Water Intake Online",
    description:
      "Calculate Water Intake free. This water intake calculator free gives a daily water goal from body weight. Water Intake Calculator Online free — no software and no signup.",
    keywords:
      "water intake calculator free, calculate water intake free, water intake calculator online free, calculate water intake, water intake calculator",
    focusKeyword: "water intake calculator free",
  },
  "period-calculator": {
    title: "Period Calculator Free | Calculate Next Period Online",
    description:
      "Calculate Next Period free. This period calculator free estimates next period dates from last period and cycle length. Period Calculator Online free — no software and no signup.",
    keywords:
      "period calculator free, calculate next period free, period calculator online free, calculate next period, period calculator",
    focusKeyword: "period calculator free",
  },
  "compound-interest-calculator": {
    title: "Compound Interest Calculator Free | Calculate Compound Interest Online",
    description:
      "Calculate Compound Interest free. This compound interest calculator free shows future value from principal, rate, time, and compounding. Compound Interest Calculator Online free — no software and no signup.",
    keywords:
      "compound interest calculator free, calculate compound interest free, compound interest calculator online free, calculate compound interest, compound interest calculator",
    focusKeyword: "compound interest calculator free",
  },
  "gst-calculator": {
    title: "GST Calculator Free | Calculate GST Online",
    description:
      "Calculate GST free. This gst calculator free adds or removes GST or VAT from any amount. GST Calculator Online free — no software and no signup.",
    keywords:
      "gst calculator free, calculate gst free, gst calculator online free, calculate gst, gst calculator",
    focusKeyword: "gst calculator free",
  },
  "tip-calculator": {
    title: "Tip Calculator Free | Calculate Tip Online",
    description:
      "Calculate Tip free. This tip calculator free splits a bill with tip percent and number of people. Tip Calculator Online free — no software and no signup.",
    keywords:
      "tip calculator free, calculate tip free, tip calculator online free, calculate tip, tip calculator",
    focusKeyword: "tip calculator free",
  },
  "discount-calculator": {
    title: "Discount Calculator Free | Calculate Discount Online",
    description:
      "Calculate Discount free. This discount calculator free finds the sale price and amount saved. Discount Calculator Online free — no software and no signup.",
    keywords:
      "discount calculator free, calculate discount free, discount calculator online free, calculate discount, discount calculator",
    focusKeyword: "discount calculator free",
  },
  "sip-calculator": {
    title: "SIP Calculator Free | Calculate SIP Online",
    description:
      "Calculate SIP free. This sip calculator free estimates SIP maturity from monthly amount, return, and years. SIP Calculator Online free — no software and no signup.",
    keywords:
      "sip calculator free, calculate sip free, sip calculator online free, calculate sip, sip calculator",
    focusKeyword: "sip calculator free",
  },
  "simple-interest-calculator": {
    title: "Simple Interest Calculator Free | Calculate Simple Interest Online",
    description:
      "Calculate Simple Interest free. This simple interest calculator free shows interest and total payable from principal, rate, and time. Simple Interest Calculator Online free — no software and no signup.",
    keywords:
      "simple interest calculator free, calculate simple interest free, simple interest calculator online free, calculate simple interest, simple interest calculator",
    focusKeyword: "simple interest calculator free",
  },
  "fd-calculator": {
    title: "FD Calculator Free | Calculate FD Online",
    description:
      "Calculate FD free. This fd calculator free estimates fixed deposit maturity from amount, rate, and years. FD Calculator Online free — no software and no signup.",
    keywords:
      "fd calculator free, calculate fd free, fd calculator online free, calculate fd, fd calculator",
    focusKeyword: "fd calculator free",
  },
  "case-converter": {
    title: "Case Converter Free | Convert Case Online",
    description:
      "Convert Case free. This case converter free switches text to upper, lower, title, or sentence case. Uppercase Converter free — no software and no signup.",
    keywords:
      "case converter free, convert case free, uppercase converter free, convert case, case converter",
    focusKeyword: "case converter free",
  },
  "password-generator": {
    title: "Password Generator Free | Generate Password Online",
    description:
      "Generate Password free. This password generator free creates a strong random password in your browser. Strong Password Generator free — no software and no signup.",
    keywords:
      "password generator free, generate password free, strong password generator free, generate password, password generator",
    focusKeyword: "password generator free",
  },
  "lorem-ipsum-generator": {
    title: "Lorem Ipsum Generator Free | Generate Lorem Ipsum Online",
    description:
      "Generate Lorem Ipsum free. This lorem ipsum generator free generates placeholder paragraphs for layouts and drafts. Dummy Text Generator free — no software and no signup.",
    keywords:
      "lorem ipsum generator free, generate lorem ipsum free, dummy text generator free, generate lorem ipsum, lorem ipsum generator",
    focusKeyword: "lorem ipsum generator free",
  },
  "text-reverser": {
    title: "Reverse Text Free | Reverse Letters Online",
    description:
      "Reverse Letters free. This reverse text free reverses characters or words in any block of text. Backwards Text free — no software and no signup.",
    keywords:
      "reverse text free, reverse letters free, backwards text free, reverse letters, reverse text",
    focusKeyword: "reverse text free",
  },
  "base64-encoder": {
    title: "Base64 Encoder Free | Encode Base64 Online",
    description:
      "Encode Base64 free. This base64 encoder free encodes or decodes text in your browser. Base64 Decoder free — no software and no signup.",
    keywords:
      "base64 encoder free, encode base64 free, base64 decoder free, encode base64, base64 encoder",
    focusKeyword: "base64 encoder free",
  },
  "slug-generator": {
    title: "Slug Generator Free | Generate Slug Online",
    description:
      "Generate Slug free. This slug generator free turns a title into a hyphenated slug for blogs and pages. URL Slug Generator free — no software and no signup.",
    keywords:
      "slug generator free, generate slug free, url slug generator free, generate slug, slug generator",
    focusKeyword: "slug generator free",
  },
  "json-formatter": {
    title: "JSON Formatter Free | Format JSON Online",
    description:
      "Format JSON free. This json formatter free beautifies or minifies JSON in your browser. JSON Beautifier free — no software and no signup.",
    keywords:
      "json formatter free, format json free, json beautifier free, format json, json formatter",
    focusKeyword: "json formatter free",
  },
  "temperature-converter": {
    title: "Temperature Converter Free | Convert Celsius to Fahrenheit Online",
    description:
      "Convert Celsius to Fahrenheit free. This temperature converter free converts Celsius, Fahrenheit, and Kelvin instantly. Celsius to Fahrenheit free — no software and no signup.",
    keywords:
      "temperature converter free, convert celsius to fahrenheit free, celsius to fahrenheit free, convert celsius to fahrenheit, temperature converter",
    focusKeyword: "temperature converter free",
  },
  "number-to-words": {
    title: "Number to Words Converter Free | Convert Number to Words Online",
    description:
      "Convert Number to Words free. This number to words converter free spells out any number in English for cheques, invoices, and forms. Number to Words free — no software and no signup.",
    keywords:
      "number to words converter free, convert number to words free, number to words free, convert number to words, number to words converter",
    focusKeyword: "number to words converter free",
  },
  "binary-converter": {
    title: "Binary Converter Free | Convert Decimal to Binary Online",
    description:
      "Convert Decimal to Binary free. This binary converter free converts between decimal, binary, and hexadecimal. Decimal to Binary free — no software and no signup.",
    keywords:
      "binary converter free, convert decimal to binary free, decimal to binary free, convert decimal to binary, binary converter",
    focusKeyword: "binary converter free",
  },
  "color-converter": {
    title: "Color Converter Free | Convert HEX RGB HSL Online",
    description:
      "Convert HEX RGB HSL free. This color converter free converts HEX, RGB, HSL, HSV, and CMYK on one page. HEX RGB HSL Converter free — no software and no signup.",
    keywords:
      "color converter free, convert hex rgb hsl free, hex rgb hsl converter free, convert hex rgb hsl, color converter",
    focusKeyword: "color converter free",
  },
  "roman-numeral-converter": {
    title: "Roman Numeral Converter Free | Convert Numbers to Roman Numerals Online",
    description:
      "Convert Numbers to Roman Numerals free. This roman numeral converter free converts numbers from 1 to 3999 into Roman numerals and back. Numbers to Roman Numerals free — no software and no signup.",
    keywords:
      "roman numeral converter free, convert numbers to roman numerals free, numbers to roman numerals free, convert numbers to roman numerals, roman numeral converter",
    focusKeyword: "roman numeral converter free",
  },
  "time-calculator": {
    title: "Time Calculator Free | Add Hours Minutes Online",
    description:
      "Add Hours Minutes free. This time calculator free adds hours, minutes, and seconds into a total time. Time Calculator Online free — no software and no signup.",
    keywords:
      "time calculator free, add hours minutes free, time calculator online free, add hours minutes, time calculator",
    focusKeyword: "time calculator free",
  },
  "date-difference-calculator": {
    title: "Date Difference Calculator Free | Calculate Days Between Dates Online",
    description:
      "Calculate Days Between Dates free. This date difference calculator free finds years, months, weeks, and days between two dates. Days Between Two Dates free — no software and no signup.",
    keywords:
      "date difference calculator free, calculate days between dates free, days between two dates free, calculate days between dates, date difference calculator",
    focusKeyword: "date difference calculator free",
  },
  "time-zone-converter": {
    title: "Time Zone Converter Free | Convert Time Zones Online",
    description:
      "Convert Time Zones free. This time zone converter free converts a date and time between world time zones. Timezone Converter free — no software and no signup.",
    keywords:
      "time zone converter free, convert time zones free, timezone converter free, convert time zones, time zone converter",
    focusKeyword: "time zone converter free",
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Free | Convert PDF to Word Online",
    description:
      "Convert PDF to Word free. This pdf to word converter free turns a PDF into a DOCX you can download instantly. PDF to Word free — no software and no signup.",
    keywords:
      "pdf to word converter free, convert pdf to word free, pdf to word free, convert pdf to word, pdf to word converter",
    focusKeyword: "pdf to word converter free",
  },
  "word-to-pdf": {
    title: "Word to PDF Converter Free | Convert Word to PDF Online",
    description:
      "Convert Word to PDF free. This word to pdf converter free turns a DOCX into a PDF you can download instantly. Word to PDF free — no software and no signup.",
    keywords:
      "word to pdf converter free, convert word to pdf free, word to pdf free, convert word to pdf, word to pdf converter",
    focusKeyword: "word to pdf converter free",
  },
  "pdf-to-jpg": {
    title: "PDF to JPG Converter Free | Convert PDF to JPG Online",
    description:
      "Convert PDF to JPG free. This pdf to jpg converter free exports every PDF page as a JPEG you can download instantly. PDF to JPG free — no software and no signup.",
    keywords:
      "pdf to jpg converter free, convert pdf to jpg free, pdf to jpg free, convert pdf to jpg, pdf to jpg converter",
    focusKeyword: "pdf to jpg converter free",
  },
  "jpg-to-pdf": {
    title: "JPG to PDF Converter Free | Convert JPG to PDF Online",
    description:
      "Convert JPG to PDF free. This jpg to pdf converter free turns JPG images into a PDF you can download instantly. JPG to PDF free — no software and no signup.",
    keywords:
      "jpg to pdf converter free, convert jpg to pdf free, jpg to pdf free, convert jpg to pdf, jpg to pdf converter",
    focusKeyword: "jpg to pdf converter free",
  },
  "excel-to-pdf": {
    title: "Excel to PDF Converter Free | Convert Excel to PDF Online",
    description:
      "Convert Excel to PDF free. This excel to pdf converter free turns XLSX or CSV into a PDF you can download instantly. Excel to PDF free — no software and no signup.",
    keywords:
      "excel to pdf converter free, convert excel to pdf free, excel to pdf free, convert excel to pdf, excel to pdf converter",
    focusKeyword: "excel to pdf converter free",
  },
  "ppt-to-pdf": {
    title: "PPT to PDF Converter Free | Convert PPT to PDF Online",
    description:
      "Convert PPT to PDF free. This ppt to pdf converter free turns a PowerPoint file into a PDF you can download instantly. PPT to PDF free — no software and no signup.",
    keywords:
      "ppt to pdf converter free, convert ppt to pdf free, ppt to pdf free, convert ppt to pdf, ppt to pdf converter",
    focusKeyword: "ppt to pdf converter free",
  },
  "compress-pdf": {
    title: "Compress PDF Free | Compress PDF Online Online",
    description:
      "Compress PDF Online free. This compress pdf free reduces PDF file size for email and uploads. PDF Compressor free — no software and no signup.",
    keywords:
      "compress pdf free, compress pdf online free, pdf compressor free, compress pdf online, compress pdf",
    focusKeyword: "compress pdf free",
  },
  "merge-pdf": {
    title: "Merge PDF Free | Merge PDF Online Online",
    description:
      "Merge PDF Online free. This merge pdf free combines multiple PDFs into one document you can download instantly. Combine PDF free — no software and no signup.",
    keywords:
      "merge pdf free, merge pdf online free, combine pdf free, merge pdf online, merge pdf",
    focusKeyword: "merge pdf free",
  },
  "pdf-to-png": {
    title: "PDF to PNG Converter Free | Convert PDF to PNG Online",
    description:
      "Convert PDF to PNG free. This pdf to png converter free exports each PDF page as a PNG you can download instantly. PDF to PNG free — no software and no signup.",
    keywords:
      "pdf to png converter free, convert pdf to png free, pdf to png free, convert pdf to png, pdf to png converter",
    focusKeyword: "pdf to png converter free",
  },
  "png-to-pdf": {
    title: "PNG to PDF Converter Free | Convert PNG to PDF Online",
    description:
      "Convert PNG to PDF free. This png to pdf converter free turns PNG images into a PDF you can download instantly. PNG to PDF free — no software and no signup.",
    keywords:
      "png to pdf converter free, convert png to pdf free, png to pdf free, convert png to pdf, png to pdf converter",
    focusKeyword: "png to pdf converter free",
  },
  "split-pdf": {
    title: "Split PDF Free | Split PDF Online Online",
    description:
      "Split PDF Online free. This split pdf free saves each page as its own PDF you can download instantly. Split PDF Pages free — no software and no signup.",
    keywords:
      "split pdf free, split pdf online free, split pdf pages free, split pdf online, split pdf",
    focusKeyword: "split pdf free",
  },
  "sleep-calculator": {
    title: "Sleep Calculator Free | Calculate Bedtime Online",
    description:
      "Calculate Bedtime free. This sleep calculator free finds bedtime or wake-up time from 90-minute sleep cycles. Sleep Cycle Calculator free — no software and no signup.",
    keywords:
      "sleep calculator free, calculate bedtime free, sleep cycle calculator free, calculate bedtime, sleep calculator",
    focusKeyword: "sleep calculator free",
  },
  "mortgage-calculator": {
    title: "Mortgage Calculator Free | Calculate Mortgage Online",
    description:
      "Calculate Mortgage free. This mortgage calculator free shows monthly payment from home price, down payment, rate, and term. Mortgage Payment Calculator free — no software and no signup.",
    keywords:
      "mortgage calculator free, calculate mortgage free, mortgage payment calculator free, calculate mortgage, mortgage calculator",
    focusKeyword: "mortgage calculator free",
  },
  "random-number-generator": {
    title: "Random Number Generator Free | Generate Random Number Online",
    description:
      "Generate Random Number free. This random number generator free picks random numbers between any min and max, including 1 to 100. Random Number Generator 1-100 free — no software and no signup.",
    keywords:
      "random number generator free, generate random number free, random number generator 1-100 free, generate random number, random number generator",
    focusKeyword: "random number generator free",
  },
  "gpa-calculator": {
    title: "GPA Calculator Free | Calculate GPA Online",
    description:
      "Calculate GPA free. This gpa calculator free finds GPA from credits and converts CGPA to percentage. CGPA to Percentage free — no software and no signup.",
    keywords:
      "gpa calculator free, calculate gpa free, cgpa to percentage free, calculate gpa, gpa calculator",
    focusKeyword: "gpa calculator free",
  },
  "png-to-jpg": {
    title: "PNG to JPG Converter Free | Convert PNG to JPG Online",
    description:
      "Convert PNG to JPG free. This png to jpg converter free turns a PNG into a JPEG you can download instantly. PNG to JPG free — no software and no signup.",
    keywords:
      "png to jpg converter free, convert png to jpg free, png to jpg free, convert png to jpg, png to jpg converter",
    focusKeyword: "png to jpg converter free",
  },
  "color-picker": {
    title: "Color Picker Free | Use Color Picker Online",
    description:
      "Use Color Picker free. This color picker free picks a color and copies HEX, RGB, HSL, HSV, and CMYK. HEX Color Picker free — no software and no signup.",
    keywords:
      "color picker free, use color picker free, hex color picker free, use color picker, color picker",
    focusKeyword: "color picker free",
  },
  "hex-to-rgb": {
    title: "HEX to RGB Converter Free | Convert HEX to RGB Online",
    description:
      "Convert HEX to RGB free. This hex to rgb converter free turns a hex code into rgb() you can copy instantly. HEX to RGB free — no software and no signup.",
    keywords:
      "hex to rgb converter free, convert hex to rgb free, hex to rgb free, convert hex to rgb, hex to rgb converter",
    focusKeyword: "hex to rgb converter free",
  },
  "rgb-to-hex": {
    title: "RGB to HEX Converter Free | Convert RGB to HEX Online",
    description:
      "Convert RGB to HEX free. This rgb to hex converter free turns RGB values into a six-digit hex code. RGB to HEX free — no software and no signup.",
    keywords:
      "rgb to hex converter free, convert rgb to hex free, rgb to hex free, convert rgb to hex, rgb to hex converter",
    focusKeyword: "rgb to hex converter free",
  },
  "hex-to-hsl": {
    title: "HEX to HSL Converter Free | Convert HEX to HSL Online",
    description:
      "Convert HEX to HSL free. This hex to hsl converter free turns a hex color into hue, saturation, and lightness. HEX to HSL free — no software and no signup.",
    keywords:
      "hex to hsl converter free, convert hex to hsl free, hex to hsl free, convert hex to hsl, hex to hsl converter",
    focusKeyword: "hex to hsl converter free",
  },
  "hsl-to-hex": {
    title: "HSL to HEX Converter Free | Convert HSL to HEX Online",
    description:
      "Convert HSL to HEX free. This hsl to hex converter free turns hue, saturation, and lightness into a hex code. HSL to HEX free — no software and no signup.",
    keywords:
      "hsl to hex converter free, convert hsl to hex free, hsl to hex free, convert hsl to hex, hsl to hex converter",
    focusKeyword: "hsl to hex converter free",
  },
  "rgb-to-hsl": {
    title: "RGB to HSL Converter Free | Convert RGB to HSL Online",
    description:
      "Convert RGB to HSL free. This rgb to hsl converter free turns RGB values into hsl() you can copy instantly. RGB to HSL free — no software and no signup.",
    keywords:
      "rgb to hsl converter free, convert rgb to hsl free, rgb to hsl free, convert rgb to hsl, rgb to hsl converter",
    focusKeyword: "rgb to hsl converter free",
  },
  "color-palette-generator": {
    title: "Color Palette Generator Free | Generate Color Palette Online",
    description:
      "Generate Color Palette free. This color palette generator free builds a matching palette from a HEX color. Color Scheme Generator free — no software and no signup.",
    keywords:
      "color palette generator free, generate color palette free, color scheme generator free, generate color palette, color palette generator",
    focusKeyword: "color palette generator free",
  },
  "gradient-generator": {
    title: "Gradient Generator Free | Generate Gradient Online",
    description:
      "Generate Gradient free. This gradient generator free previews a linear or radial blend and copies the CSS. Linear Gradient Generator free — no software and no signup.",
    keywords:
      "gradient generator free, generate gradient free, linear gradient generator free, generate gradient, gradient generator",
    focusKeyword: "gradient generator free",
  },
  "css-gradient-generator": {
    title: "CSS Gradient Generator Free | Generate CSS Gradient Online",
    description:
      "Generate CSS Gradient free. This css gradient generator free copies a background rule for linear, radial, or repeating gradients. CSS Linear Gradient free — no software and no signup.",
    keywords:
      "css gradient generator free, generate css gradient free, css linear gradient free, generate css gradient, css gradient generator",
    focusKeyword: "css gradient generator free",
  },
  "color-shades-generator": {
    title: "Color Shades Generator Free | Generate Color Shades Online",
    description:
      "Generate Color Shades free. This color shades generator free generates darker shades from any HEX color. Darker Shades free — no software and no signup.",
    keywords:
      "color shades generator free, generate color shades free, darker shades free, generate color shades, color shades generator",
    focusKeyword: "color shades generator free",
  },
  "color-tint-generator": {
    title: "Color Tint Generator Free | Generate Color Tints Online",
    description:
      "Generate Color Tints free. This color tint generator free generates lighter tints from any HEX color. Lighter Tints free — no software and no signup.",
    keywords:
      "color tint generator free, generate color tints free, lighter tints free, generate color tints, color tint generator",
    focusKeyword: "color tint generator free",
  },
  "color-tone-generator": {
    title: "Color Tone Generator Free | Generate Color Tones Online",
    description:
      "Generate Color Tones free. This color tone generator free generates muted tones from any HEX color. Muted Tones free — no software and no signup.",
    keywords:
      "color tone generator free, generate color tones free, muted tones free, generate color tones, color tone generator",
    focusKeyword: "color tone generator free",
  },
  "complementary-color-generator": {
    title: "Complementary Colors Free | Find Complementary Colors Online",
    description:
      "Find Complementary Colors free. This complementary colors free finds the 180° opposite HEX color instantly. Opposite Color free — no software and no signup.",
    keywords:
      "complementary colors free, find complementary colors free, opposite color free, find complementary colors, complementary colors",
    focusKeyword: "complementary colors free",
  },
  "analogous-color-generator": {
    title: "Analogous Colors Free | Generate Analogous Colors Online",
    description:
      "Generate Analogous Colors free. This analogous colors free gets neighboring hues from a HEX seed. Analogous Palette free — no software and no signup.",
    keywords:
      "analogous colors free, generate analogous colors free, analogous palette free, generate analogous colors, analogous colors",
    focusKeyword: "analogous colors free",
  },
  "triadic-color-generator": {
    title: "Triadic Colors Free | Generate Triadic Colors Online",
    description:
      "Generate Triadic Colors free. This triadic colors free gets three hues 120° apart from one HEX color. Triadic Palette free — no software and no signup.",
    keywords:
      "triadic colors free, generate triadic colors free, triadic palette free, generate triadic colors, triadic colors",
    focusKeyword: "triadic colors free",
  },
  "split-complementary-generator": {
    title: "Split Complementary Colors Free | Generate Split Complementary Colors Online",
    description:
      "Generate Split Complementary Colors free. This split complementary colors free gets contrast with less clash from one HEX seed. Split Complementary Palette free — no software and no signup.",
    keywords:
      "split complementary colors free, generate split complementary colors free, split complementary palette free, generate split complementary colors, split complementary colors",
    focusKeyword: "split complementary colors free",
  },
  "monochromatic-palette-generator": {
    title: "Monochromatic Palette Free | Generate Monochromatic Palette Online",
    description:
      "Generate Monochromatic Palette free. This monochromatic palette free builds five lightness steps from one hue. Single Hue Palette free — no software and no signup.",
    keywords:
      "monochromatic palette free, generate monochromatic palette free, single hue palette free, generate monochromatic palette, monochromatic palette",
    focusKeyword: "monochromatic palette free",
  },
  "random-color-generator": {
    title: "Random Color Generator Free | Generate Random Color Online",
    description:
      "Generate Random Color free. This random color generator free gives a random HEX, RGB, and HSL color instantly. Random HEX Color free — no software and no signup.",
    keywords:
      "random color generator free, generate random color free, random hex color free, generate random color, random color generator",
    focusKeyword: "random color generator free",
  },
  "color-contrast-checker": {
    title: "Color Contrast Checker Free | Check Color Contrast Online",
    description:
      "Check Color Contrast free. This color contrast checker free shows the contrast ratio for text and background HEX. Contrast Ratio Calculator free — no software and no signup.",
    keywords:
      "color contrast checker free, check color contrast free, contrast ratio calculator free, check color contrast, color contrast checker",
    focusKeyword: "color contrast checker free",
  },
  "wcag-contrast-checker": {
    title: "WCAG Contrast Checker Free | Check WCAG Contrast Online",
    description:
      "Check WCAG Contrast free. This wcag contrast checker free tests normal text, large text, and UI graphics for AA and AAA. WCAG AA free — no software and no signup.",
    keywords:
      "wcag contrast checker free, check wcag contrast free, wcag aa free, check wcag contrast, wcag contrast checker",
    focusKeyword: "wcag contrast checker free",
  },
  "color-blindness-simulator": {
    title: "Color Blindness Simulator Free | Simulate Color Blindness Online",
    description:
      "Simulate Color Blindness free. This color blindness simulator free previews a HEX color with protanopia, deuteranopia, or tritanopia. Protanopia Simulator free — no software and no signup.",
    keywords:
      "color blindness simulator free, simulate color blindness free, protanopia simulator free, simulate color blindness, color blindness simulator",
    focusKeyword: "color blindness simulator free",
  },
  "image-color-palette-extractor": {
    title: "Extract Colors from Image Free | Get Colors from Image Online",
    description:
      "Get Colors from Image free. This extract colors from image free builds a HEX palette from an image in your browser. Image Color Palette free — no software and no signup.",
    keywords:
      "extract colors from image free, get colors from image free, image color palette free, get colors from image, extract colors from image",
    focusKeyword: "extract colors from image free",
  },
  "dominant-color-extractor": {
    title: "Dominant Color from Image Free | Find Dominant Color Online",
    description:
      "Find Dominant Color free. This dominant color from image free finds the most used color and copies HEX, RGB, and HSL. Dominant Color Extractor free — no software and no signup.",
    keywords:
      "dominant color from image free, find dominant color free, dominant color extractor free, find dominant color, dominant color from image",
    focusKeyword: "dominant color from image free",
  },
  "color-name-finder": {
    title: "HEX to Color Name Free | Find Color Name Online",
    description:
      "Find Color Name free. This hex to color name free finds the closest CSS color name for any HEX code. Color Name Finder free — no software and no signup.",
    keywords:
      "hex to color name free, find color name free, color name finder free, find color name, hex to color name",
    focusKeyword: "hex to color name free",
  },
  "color-temperature-tool": {
    title: "Warm or Cool Color Free | Check Warm or Cool Color Online",
    description:
      "Check Warm or Cool Color free. This warm or cool color free checks if a HEX color is warm, cool, or neutral. Warm Cool Color Checker free — no software and no signup.",
    keywords:
      "warm or cool color free, check warm or cool color free, warm cool color checker free, check warm or cool color, warm or cool color",
    focusKeyword: "warm or cool color free",
  },
  "css-color-generator": {
    title: "CSS Color Code Free | Generate CSS Color Online",
    description:
      "Generate CSS Color free. This css color code free copies color, background-color, and a CSS variable from HEX. CSS Color Code Generator free — no software and no signup.",
    keywords:
      "css color code free, generate css color free, css color code generator free, generate css color, css color code",
    focusKeyword: "css color code free",
  },
  "tailwind-color-converter": {
    title: "HEX to Tailwind Free | Convert HEX to Tailwind Online",
    description:
      "Convert HEX to Tailwind free. This hex to tailwind free finds the nearest token and class such as amber-500. Tailwind Color Converter free — no software and no signup.",
    keywords:
      "hex to tailwind free, convert hex to tailwind free, tailwind color converter free, convert hex to tailwind, hex to tailwind",
    focusKeyword: "hex to tailwind free",
  },
  "ideal-weight-calculator": {
    title: "Ideal Weight Calculator Free | Calculate Ideal Weight Online",
    description:
      "Calculate Ideal Weight free. This ideal weight calculator free uses Devine, Robinson, Hamwi, and Miller plus a healthy BMI range. Ideal Body Weight Calculator free — no software and no signup.",
    keywords:
      "ideal weight calculator free, calculate ideal weight free, ideal body weight calculator free, calculate ideal weight, ideal weight calculator",
    focusKeyword: "ideal weight calculator free",
  },
  "cagr-calculator": {
    title: "CAGR Calculator Free | Calculate CAGR Online",
    description:
      "Calculate CAGR free. This cagr calculator free finds compound annual growth rate from beginning value, ending value, and years. Compound Annual Growth Rate Calculator free — no software and no signup.",
    keywords:
      "cagr calculator free, calculate cagr free, compound annual growth rate calculator free, calculate cagr, cagr calculator",
    focusKeyword: "cagr calculator free",
  },
  "find-and-replace": {
    title: "Find and Replace Free | Find and Replace Text Online",
    description:
      "Find and Replace Text free. This find and replace free replaces every match in pasted text, with or without matching case. Find Replace Text Online free — no software and no signup.",
    keywords:
      "find and replace free, find and replace text free, find replace text online free, find and replace text, find and replace",
    focusKeyword: "find and replace free",
  },
  "unix-timestamp-converter": {
    title: "Unix Timestamp Converter Free | Convert Unix Timestamp Online",
    description:
      "Convert Unix Timestamp free. This unix timestamp converter free turns epoch seconds or milliseconds into UTC and local time. Epoch Converter free — no software and no signup.",
    keywords:
      "unix timestamp converter free, convert unix timestamp free, epoch converter free, convert unix timestamp, unix timestamp converter",
    focusKeyword: "unix timestamp converter free",
  },
  "webp-to-jpg": {
    title: "WebP to JPG Converter Free | Convert WebP to JPG Online",
    description:
      "Convert WebP to JPG free. This webp to jpg converter free turns a WebP into a JPEG you can download instantly. WebP to JPG free — no software and no signup.",
    keywords:
      "webp to jpg converter free, convert webp to jpg free, webp to jpg free, convert webp to jpg, webp to jpg converter",
    focusKeyword: "webp to jpg converter free",
  },
  "color-mixer": {
    title: "Color Mixer Free | Mix Colors Online",
    description:
      "Mix Colors free. This color mixer free blends two HEX colors by mix percent and copies HEX, RGB, and HSL. Color Blender Online free — no software and no signup.",
    keywords:
      "color mixer free, mix colors free, color blender online free, mix colors, color mixer",
    focusKeyword: "color mixer free",
  },
};

const pageSeo: Record<string, SeoEntry> = {
  "/": seo(
    "/",
    "Home",
    "Free Online Calculators and PDF Converter | SmartToolX",
    "Free online calculators, color tools, and a free PDF converter in your browser. JPG to PDF, color mixer, ideal weight, CAGR, Unix timestamp, WebP to JPG, color picker, sleep calculator, mortgage calculator, GPA calculator, PNG to JPG, BMI, EMI, and more. No account needed.",
    {
      keywords:
        "color mixer, ideal weight calculator, CAGR calculator, unix timestamp converter, WebP to JPG, color tools, color picker, sleep calculator, mortgage calculator, GPA calculator, PNG to JPG, free PDF converter, free online calculator, SmartToolX",
      h1: "Free online calculators and PDF converter",
      focusKeyword: "free online calculators",
      schemaType: "WebSite",
    },
  ),
  "/tools": seo(
    "/tools",
    "All Tools",
    "All Free Tools | SmartToolX",
    "Browse every SmartToolX calculator, converter, text tool, file converter, and color tool. JPG to PDF, find and replace, color mixer, number to words, color picker, sleep calculator, mortgage, GPA, PNG to JPG, WebP to JPG, and more. Each one runs in your browser.",
    {
      keywords:
        "free online tools, find and replace, color mixer, color picker, sleep calculator, mortgage calculator, GPA calculator, PNG to JPG, WebP to JPG, all tools, calculator list, SmartToolX tools",
      focusKeyword: "free online tools",
    },
  ),
  "/calculators": seo(
    "/calculators",
    "Calculators",
    "Free Online Calculators | SmartToolX",
    "Health and finance calculators for sleep, ideal weight, mortgage, CAGR, period dates, BMI, EMI, GPA, FD, GST, SIP, calories, and more. Open a tool, enter numbers, and see the result.",
    {
      keywords:
        "ideal weight calculator, CAGR calculator, sleep calculator, mortgage calculator, GPA calculator, online calculators, period calculator, BMI calculator, EMI calculator, FD calculator, calorie calculator",
      focusKeyword: "online calculators",
    },
  ),
  "/converters": seo(
    "/converters",
    "Converters",
    "Free Online Converters | SmartToolX",
    "Convert currency, units, number to words, temperature, time zones, Unix timestamps, GPA, and more without leaving the page. Live rates for money, standard factors for the rest.",
    {
      keywords:
        "unix timestamp converter, number to words, GPA calculator, CGPA to percentage, unit converter, currency converter, time zone converter, temperature converter, live exchange rates, binary converter",
      focusKeyword: "unit converter",
    },
  ),
  "/text-tools": seo(
    "/text-tools",
    "Text Tools",
    "Free Text Tools Online | SmartToolX",
    "Count words, find and replace, format JSON, generate random numbers, passwords, and QR codes, change case, and build URL slugs. Paste text and copy the result.",
    {
      keywords:
        "find and replace, random number generator, JSON formatter, word counter, QR code generator, password generator, case converter, slug generator, text tools",
      focusKeyword: "text tools",
    },
  ),
  "/finance": seo(
    "/finance",
    "Finance",
    "Free Finance Calculators | SmartToolX",
    "Mortgage, CAGR, EMI, FD, GST, SIP, compound interest, tips, discounts, and live currency conversion for everyday money decisions.",
    {
      keywords:
        "CAGR calculator, mortgage calculator, loan EMI calculator, FD calculator, GST calculator, SIP calculator, percentage calculator, currency converter, finance calculator",
      focusKeyword: "finance calculator",
    },
  ),
  "/file-converter": seo(
    "/file-converter",
    "File Converter",
    "Free PDF Converter Online | SmartToolX",
    "Free PDF converter online. JPG to PDF, WebP to JPG, PPT to PDF, PDF to Word, Word to PDF, compress PDF, merge PDF, split PDF, and PNG to JPG. No signup. Files stay in your browser.",
    {
      keywords:
        "free PDF converter, WebP to JPG, PDF to Word online free, compress PDF online, merge PDF, split PDF, Word to PDF, PNG to JPG, file converter",
      focusKeyword: "free PDF converter",
      h1: "Free PDF Converter Online",
    },
  ),
  "/colors": seo(
    "/colors",
    "Color Tools",
    "Free Color Tools Online | SmartToolX",
    "Free color tools online. Open a picker, mixer, converter, palette, gradient, or contrast checker in your browser. No account and no upload.",
    {
      keywords:
        "color mixer, color tools, free color tools, online color tools, color utilities, free color picker tools",
      focusKeyword: "color tools",
      h1: "Free Color Tools Online",
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
