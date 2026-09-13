export type ToolCategory = "health" | "finance" | "text" | "convert" | "files";

export type Tool = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  category: ToolCategory;
};

export const categories = [
  { id: "all", label: "All" },
  { id: "health", label: "Health" },
  { id: "finance", label: "Finance" },
  { id: "text", label: "Text" },
  { id: "convert", label: "Convert" },
  { id: "files", label: "Files" },
] as const;

export const tools: Tool[] = [
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    icon: "%",
    description: "Free percentage calculator online. Find X percent of Y.",
    category: "finance",
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    icon: "BMI",
    description: "Check BMI using cm, meters, feet, kg, lb, or stone.",
    category: "health",
  },
  {
    slug: "loan-emi-calculator",
    name: "Loan EMI Calculator",
    icon: "$",
    description: "Free EMI calculator online. Monthly payment for any loan.",
    category: "finance",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    icon: "Aa",
    description: "Free word counter online. Words, characters, and reading time.",
    category: "text",
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    icon: "⇄",
    description: "Free live currency converter for 150+ currencies.",
    category: "convert",
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    icon: "Δ",
    description: "Free age calculator online. Years, months, and days.",
    category: "health",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    icon: "QR",
    description: "Free QR code generator online. From any link or text.",
    category: "text",
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    icon: "kg",
    description: "Free unit converter online. Length, weight, volume, and more.",
    category: "convert",
  },
  {
    slug: "calorie-calculator",
    name: "Calorie Calculator",
    icon: "kcal",
    description: "Daily calories from age, height, weight, and activity. Use cm, feet, kg, lb, or stone.",
    category: "health",
  },
  {
    slug: "bmr-calculator",
    name: "BMR Calculator",
    icon: "BMR",
    description: "Resting calories from age, sex, height, and weight. Use cm, feet, kg, lb, or stone.",
    category: "health",
  },
  {
    slug: "body-fat-calculator",
    name: "Body Fat Calculator",
    icon: "BF%",
    description: "Estimate body fat percentage from BMI, age, and sex.",
    category: "health",
  },
  {
    slug: "pregnancy-due-date-calculator",
    name: "Due Date Calculator",
    icon: "EDD",
    description: "Estimated due date from the first day of your last period.",
    category: "health",
  },
  {
    slug: "ovulation-calculator",
    name: "Ovulation Calculator",
    icon: "OV",
    description: "Fertile window and ovulation day from cycle length.",
    category: "health",
  },
  {
    slug: "water-intake-calculator",
    name: "Water Intake Calculator",
    icon: "H2O",
    description: "Daily water goal based on body weight.",
    category: "health",
  },
  {
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    icon: "CI",
    description: "Future value with principal, rate, time, and compounding.",
    category: "finance",
  },
  {
    slug: "gst-calculator",
    name: "GST Calculator",
    icon: "GST",
    description: "Free GST calculator online. Add or remove GST or VAT.",
    category: "finance",
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    icon: "tip",
    description: "Tip amount and per-person split for any bill.",
    category: "finance",
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    icon: "−%",
    description: "Sale price and amount saved from a discount percent.",
    category: "finance",
  },
  {
    slug: "sip-calculator",
    name: "SIP Calculator",
    icon: "SIP",
    description: "Free SIP calculator online. Estimate monthly SIP maturity.",
    category: "finance",
  },
  {
    slug: "simple-interest-calculator",
    name: "Simple Interest Calculator",
    icon: "SI",
    description: "Interest and total payable on a simple-interest loan.",
    category: "finance",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    icon: "aA",
    description: "Switch text to upper, lower, title, or sentence case.",
    category: "text",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    icon: "***",
    description: "Create a strong random password in your browser.",
    category: "text",
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    icon: "Lip",
    description: "Generate placeholder paragraphs for layouts and drafts.",
    category: "text",
  },
  {
    slug: "text-reverser",
    name: "Reverse Text",
    icon: "↺",
    description: "Reverse characters or words in any block of text.",
    category: "text",
  },
  {
    slug: "base64-encoder",
    name: "Base64 Encoder",
    icon: "64",
    description: "Encode or decode Base64 text without leaving the page.",
    category: "text",
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    icon: "/-",
    description: "Turn a title into a URL-safe slug for blogs and pages.",
    category: "text",
  },
  {
    slug: "temperature-converter",
    name: "Temperature Converter",
    icon: "°C",
    description: "Convert Celsius, Fahrenheit, and Kelvin instantly.",
    category: "convert",
  },
  {
    slug: "number-to-words",
    name: "Number to Words",
    icon: "123",
    description: "Spell out any number in English words.",
    category: "convert",
  },
  {
    slug: "binary-converter",
    name: "Binary Converter",
    icon: "01",
    description: "Convert between decimal, binary, and hexadecimal.",
    category: "convert",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    icon: "#",
    description: "Convert HEX colors to RGB and back.",
    category: "convert",
  },
  {
    slug: "roman-numeral-converter",
    name: "Roman Numeral Converter",
    icon: "IV",
    description: "Convert numbers to Roman numerals and back.",
    category: "convert",
  },
  {
    slug: "time-calculator",
    name: "Time Calculator",
    icon: "h:m",
    description: "Add hours, minutes, and seconds into a total time.",
    category: "convert",
  },
  {
    slug: "date-difference-calculator",
    name: "Date Difference Calculator",
    icon: "2D",
    description: "Days, weeks, months, and years between two dates.",
    category: "convert",
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word Converter",
    icon: "DOC",
    description: "Convert PDF to Word online free. Download an editable DOCX.",
    category: "files",
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF Converter",
    icon: "PDF",
    description: "Convert Word to PDF online free. No account needed.",
    category: "files",
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG Converter",
    icon: "JPG",
    description: "Convert PDF to JPG online free. Every page as a JPEG.",
    category: "files",
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF Converter",
    icon: "IMG",
    description: "Convert JPG to PDF online free. Combine images into one file.",
    category: "files",
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF Converter",
    icon: "XLS",
    description: "Convert Excel to PDF online free. XLSX and CSV supported.",
    category: "files",
  },
  {
    slug: "ppt-to-pdf",
    name: "PPT to PDF Converter",
    icon: "PPT",
    description: "Convert PPT to PDF online free. Works with .ppt and .pptx.",
    category: "files",
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    icon: "ZIP",
    description: "Compress PDF online free. Reduce file size in your browser.",
    category: "files",
  },
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    icon: "MRG",
    description: "Merge PDF files online free. Combine them into one document.",
    category: "files",
  },
  {
    slug: "pdf-to-png",
    name: "PDF to PNG Converter",
    icon: "PNG",
    description: "Convert PDF to PNG online free. Sharp page images.",
    category: "files",
  },
  {
    slug: "png-to-pdf",
    name: "PNG to PDF Converter",
    icon: "PNG",
    description: "Convert PNG to PDF online free. One or more images.",
    category: "files",
  },
];

export const featuredSlugs = [
  "percentage-calculator",
  "bmi-calculator",
  "loan-emi-calculator",
  "word-counter",
  "currency-converter",
  "age-calculator",
  "qr-code-generator",
  "unit-converter",
] as const;

export const fileConverterSlugs = [
  "pdf-to-word",
  "word-to-pdf",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "excel-to-pdf",
  "ppt-to-pdf",
  "compress-pdf",
  "merge-pdf",
  "pdf-to-png",
  "png-to-pdf",
] as const;

export const toolCount = tools.length;

export const categoryPages = {
  calculators: {
    title: "Calculators",
    description:
      "Health, finance, and everyday calculators that run in your browser.",
    slugs: [
      ...tools
        .filter(
          (tool) => tool.category === "health" || tool.category === "finance",
        )
        .map((tool) => tool.slug),
      "date-difference-calculator",
    ],
  },
  converters: {
    title: "Converters",
    description: "Currency, units, and more. Convert without leaving the page.",
    slugs: tools.filter((tool) => tool.category === "convert").map((t) => t.slug),
  },
  "text-tools": {
    title: "Text Tools",
    description: "Count, generate, and transform text in a click.",
    slugs: tools.filter((tool) => tool.category === "text").map((t) => t.slug),
  },
  finance: {
    title: "Finance",
    description:
      "Payments, percentages, and currency tools for money decisions.",
    slugs: [
      ...tools.filter((tool) => tool.category === "finance").map((t) => t.slug),
      "currency-converter",
    ],
  },
  "file-converter": {
    title: "Free PDF Converter Online",
    description:
      "Free PDF converter online. PDF to Word, compress PDF, merge PDF, and more. Files stay in your browser.",
    slugs: [...fileConverterSlugs],
  },
} as const;

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsBySlugs(slugs: readonly string[]) {
  return slugs
    .map((slug) => getTool(slug))
    .filter((tool): tool is Tool => Boolean(tool));
}

export function getToolsByCategory(category: ToolCategory | "all") {
  if (category === "all") return tools;
  return tools.filter((tool) => tool.category === category);
}

export function getFileConverterTools() {
  return getToolsBySlugs(fileConverterSlugs);
}

export function getFeaturedTools() {
  return getToolsBySlugs(featuredSlugs);
}
