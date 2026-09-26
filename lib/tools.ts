export type ToolCategory = "health" | "finance" | "text" | "convert" | "files" | "color";

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
    slug: "period-calculator",
    name: "Period Calculator",
    icon: "P",
    description: "Next period dates from last period and cycle length.",
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
    slug: "fd-calculator",
    name: "FD Calculator",
    icon: "FD",
    description: "Fixed deposit maturity from amount, rate, and years.",
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
    slug: "json-formatter",
    name: "JSON Formatter",
    icon: "{}",
    description: "Beautify or minify JSON in your browser.",
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
    description:
      "Free all-in-one color converter. Paste HEX, RGB, HSL, HSV, or CMYK and copy every other format.",
    category: "color",
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
    slug: "time-zone-converter",
    name: "Time Zone Converter",
    icon: "TZ",
    description: "Convert a date and time between world time zones.",
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
  {
    slug: "split-pdf",
    name: "Split PDF",
    icon: "SPL",
    description: "Split PDF online free. Save each page as its own file.",
    category: "files",
  },
  {
    slug: "sleep-calculator",
    name: "Sleep Calculator",
    icon: "SLP",
    description:
      "Free sleep calculator online. Find bedtime or wake time from 90-minute sleep cycles.",
    category: "health",
  },
  {
    slug: "ideal-weight-calculator",
    name: "Ideal Weight Calculator",
    icon: "IBW",
    description:
      "Free ideal weight calculator online. Devine, Robinson, Hamwi, and Miller formulas plus a healthy BMI range.",
    category: "health",
  },
  {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    icon: "MTG",
    description:
      "Free mortgage calculator online. Monthly payment from home price, down payment, rate, and term.",
    category: "finance",
  },
  {
    slug: "cagr-calculator",
    name: "CAGR Calculator",
    icon: "CGR",
    description:
      "Free CAGR calculator online. Compound annual growth rate from beginning value, ending value, and years.",
    category: "finance",
  },
  {
    slug: "random-number-generator",
    name: "Random Number Generator",
    icon: "RNG",
    description:
      "Free random number generator online. Pick random numbers between any min and max.",
    category: "text",
  },
  {
    slug: "find-and-replace",
    name: "Find and Replace",
    icon: "FNR",
    description:
      "Free find and replace online. Replace every match in pasted text, with or without matching case.",
    category: "text",
  },
  {
    slug: "gpa-calculator",
    name: "GPA Calculator",
    icon: "GPA",
    description:
      "Free GPA calculator online. GPA from credits, plus CGPA to percentage and back.",
    category: "convert",
  },
  {
    slug: "unix-timestamp-converter",
    name: "Unix Timestamp Converter",
    icon: "UNIX",
    description:
      "Free Unix timestamp converter online. Convert epoch seconds or milliseconds to UTC and local time.",
    category: "convert",
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG Converter",
    icon: "JPG",
    description:
      "Convert PNG to JPG online free. Download a JPEG in your browser. No account.",
    category: "files",
  },
  {
    slug: "webp-to-jpg",
    name: "WebP to JPG Converter",
    icon: "JPG",
    description:
      "Convert WebP to JPG online free. Download a JPEG in your browser. No account.",
    category: "files",
  },
  {
    slug: "color-picker",
    name: "Color Picker",
    icon: "HEX",
    description:
      "Free color picker online. Pick a color and copy HEX, RGB, HSL, HSV, and CMYK.",
    category: "color",
  },
  {
    slug: "hex-to-rgb",
    name: "HEX to RGB",
    icon: "RGB",
    description: "Convert a HEX color code to RGB. Free in your browser.",
    category: "color",
  },
  {
    slug: "rgb-to-hex",
    name: "RGB to HEX",
    icon: "HEX",
    description: "Convert RGB values to a HEX color code. Free in your browser.",
    category: "color",
  },
  {
    slug: "hex-to-hsl",
    name: "HEX to HSL",
    icon: "HSL",
    description: "Convert a HEX color code to HSL. Free in your browser.",
    category: "color",
  },
  {
    slug: "hsl-to-hex",
    name: "HSL to HEX",
    icon: "HEX",
    description: "Convert HSL values to a HEX color code. Free in your browser.",
    category: "color",
  },
  {
    slug: "rgb-to-hsl",
    name: "RGB to HSL",
    icon: "HSL",
    description: "Convert RGB values to HSL. Free in your browser.",
    category: "color",
  },
  {
    slug: "color-palette-generator",
    name: "Color Palette Generator",
    icon: "PAL",
    description:
      "Free color palette generator. Build a matching palette from any HEX color.",
    category: "color",
  },
  {
    slug: "gradient-generator",
    name: "Gradient Generator",
    icon: "GRD",
    description:
      "Free gradient generator. Create a linear or radial CSS gradient from two colors.",
    category: "color",
  },
  {
    slug: "css-gradient-generator",
    name: "CSS Gradient Generator",
    icon: "CSS",
    description:
      "Generate ready-to-use CSS for linear, radial, or repeating gradients.",
    category: "color",
  },
  {
    slug: "color-shades-generator",
    name: "Color Shades Generator",
    icon: "SHA",
    description: "Generate darker shades from any HEX color.",
    category: "color",
  },
  {
    slug: "color-tint-generator",
    name: "Color Tint Generator",
    icon: "TNT",
    description: "Generate lighter tints from any HEX color.",
    category: "color",
  },
  {
    slug: "color-tone-generator",
    name: "Color Tone Generator",
    icon: "TON",
    description: "Generate muted tones from any HEX color.",
    category: "color",
  },
  {
    slug: "complementary-color-generator",
    name: "Complementary Colors Generator",
    icon: "180",
    description: "Find complementary colors for any HEX code. 180° opposite hue pair.",
    category: "color",
  },
  {
    slug: "analogous-color-generator",
    name: "Analogous Colors Generator",
    icon: "ANL",
    description: "Generate an analogous color palette from a HEX color.",
    category: "color",
  },
  {
    slug: "triadic-color-generator",
    name: "Triadic Colors Generator",
    icon: "TRI",
    description: "Generate a triadic color combination from a HEX color.",
    category: "color",
  },
  {
    slug: "split-complementary-generator",
    name: "Split Complementary Colors",
    icon: "SPL",
    description: "Generate a split-complementary palette from a HEX color.",
    category: "color",
  },
  {
    slug: "monochromatic-palette-generator",
    name: "Monochromatic Palette Generator",
    icon: "MON",
    description: "Create a monochromatic palette from a HEX color.",
    category: "color",
  },
  {
    slug: "random-color-generator",
    name: "Random Color Generator",
    icon: "RND",
    description: "Free random color generator. Get a random HEX, RGB, and HSL color.",
    category: "color",
  },
  {
    slug: "color-contrast-checker",
    name: "Color Contrast Checker",
    icon: "AA",
    description: "Check text and background contrast ratio for readable UI.",
    category: "color",
  },
  {
    slug: "wcag-contrast-checker",
    name: "WCAG Contrast Checker",
    icon: "AAA",
    description:
      "Test text and background colors against WCAG AA and AAA, including large text.",
    category: "color",
  },
  {
    slug: "color-blindness-simulator",
    name: "Color Blindness Simulator",
    icon: "CB",
    description:
      "Preview how a color looks with protanopia, deuteranopia, or tritanopia.",
    category: "color",
  },
  {
    slug: "image-color-palette-extractor",
    name: "Extract Colors from Image",
    icon: "IMG",
    description: "Extract a color palette from an image. No upload. Copy HEX swatches.",
    category: "color",
  },
  {
    slug: "dominant-color-extractor",
    name: "Dominant Color Extractor",
    icon: "DOM",
    description: "Find the dominant color in an uploaded image. Runs in your browser.",
    category: "color",
  },
  {
    slug: "color-name-finder",
    name: "Color Name Finder",
    icon: "NAM",
    description: "Find the closest CSS color name for any HEX code.",
    category: "color",
  },
  {
    slug: "color-temperature-tool",
    name: "Warm or Cool Color Checker",
    icon: "K",
    description: "Check if a HEX color is warm, cool, or neutral, plus an estimated Kelvin value.",
    category: "color",
  },
  {
    slug: "css-color-generator",
    name: "CSS Color Code Generator",
    icon: "VAR",
    description: "Generate CSS color, background-color, and custom property declarations.",
    category: "color",
  },
  {
    slug: "tailwind-color-converter",
    name: "HEX to Tailwind Converter",
    icon: "TW",
    description:
      "Convert HEX to the nearest Tailwind CSS token and class, such as amber-500.",
    category: "color",
  },
  {
    slug: "color-mixer",
    name: "Color Mixer",
    icon: "MIX",
    description:
      "Free color mixer online. Blend two HEX colors by mix percent and copy the result HEX, RGB, and HSL.",
    category: "color",
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
  "split-pdf",
  "png-to-jpg",
  "webp-to-jpg",
] as const;

export const toolCount = tools.length;

export const categoryPages = {
  calculators: {
    title: "Calculators",
    description:
      "Health, finance, and everyday calculators including sleep, ideal weight, mortgage, CAGR, period, BMI, EMI, GPA, and FD.",
    slugs: [
      ...tools
        .filter(
          (tool) => tool.category === "health" || tool.category === "finance",
        )
        .map((tool) => tool.slug),
      "date-difference-calculator",
      "gpa-calculator",
    ],
  },
  converters: {
    title: "Converters",
    description:
      "Currency, units, time zones, Unix timestamps, GPA, and more. Convert without leaving the page.",
    slugs: tools.filter((tool) => tool.category === "convert").map((t) => t.slug),
  },
  "text-tools": {
    title: "Text Tools",
    description:
      "Count words, find and replace, format JSON, generate random numbers, and transform text in a click.",
    slugs: tools.filter((tool) => tool.category === "text").map((t) => t.slug),
  },
  finance: {
    title: "Finance",
    description:
      "Mortgage, CAGR, EMI, FD, GST, SIP, percentages, and currency tools for money decisions.",
    slugs: [
      ...tools.filter((tool) => tool.category === "finance").map((t) => t.slug),
      "currency-converter",
    ],
  },
  "file-converter": {
    title: "Free PDF Converter Online",
    description:
      "Free PDF converter online. PDF to Word, compress PDF, merge PDF, split PDF, PNG to JPG, WebP to JPG, and more. Files stay in your browser.",
    slugs: [...fileConverterSlugs],
  },
  colors: {
    title: "Free Color Tools Online",
    description:
      "Browse free color tools in your browser. Pickers, converters, mixers, palettes, gradients, and contrast checkers. No account.",
    slugs: [
      "color-picker",
      "hex-to-rgb",
      "rgb-to-hex",
      "hex-to-hsl",
      "hsl-to-hex",
      "rgb-to-hsl",
      "color-converter",
      "color-palette-generator",
      "gradient-generator",
      "css-gradient-generator",
      "color-shades-generator",
      "color-tint-generator",
      "color-tone-generator",
      "complementary-color-generator",
      "analogous-color-generator",
      "triadic-color-generator",
      "split-complementary-generator",
      "monochromatic-palette-generator",
      "random-color-generator",
      "color-contrast-checker",
      "wcag-contrast-checker",
      "color-blindness-simulator",
      "image-color-palette-extractor",
      "dominant-color-extractor",
      "color-name-finder",
      "color-temperature-tool",
      "css-color-generator",
      "tailwind-color-converter",
      "color-mixer",
    ],
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

const relatedBySlug: Record<string, readonly string[]> = {
  "color-picker": [
    "css-color-generator",
    "color-name-finder",
    "color-palette-generator",
    "random-color-generator",
  ],
  "hex-to-rgb": ["rgb-to-hex", "hex-to-hsl", "color-converter", "color-picker"],
  "rgb-to-hex": ["hex-to-rgb", "rgb-to-hsl", "color-converter", "color-picker"],
  "hex-to-hsl": ["hsl-to-hex", "hex-to-rgb", "color-converter", "color-shades-generator"],
  "hsl-to-hex": ["hex-to-hsl", "rgb-to-hsl", "color-converter", "css-color-generator"],
  "rgb-to-hsl": ["hex-to-hsl", "rgb-to-hex", "color-converter", "color-tint-generator"],
  "color-converter": ["hex-to-rgb", "rgb-to-hex", "hex-to-hsl", "color-picker"],
  "color-palette-generator": [
    "complementary-color-generator",
    "monochromatic-palette-generator",
    "color-shades-generator",
    "color-picker",
  ],
  "gradient-generator": [
    "css-gradient-generator",
    "color-palette-generator",
    "color-picker",
    "css-color-generator",
  ],
  "css-gradient-generator": [
    "gradient-generator",
    "css-color-generator",
    "color-palette-generator",
    "color-picker",
  ],
  "color-shades-generator": [
    "color-tint-generator",
    "color-tone-generator",
    "monochromatic-palette-generator",
    "hex-to-hsl",
  ],
  "color-tint-generator": [
    "color-shades-generator",
    "color-tone-generator",
    "monochromatic-palette-generator",
    "hex-to-hsl",
  ],
  "color-tone-generator": [
    "color-shades-generator",
    "color-tint-generator",
    "monochromatic-palette-generator",
    "color-palette-generator",
  ],
  "complementary-color-generator": [
    "split-complementary-generator",
    "analogous-color-generator",
    "triadic-color-generator",
    "color-palette-generator",
  ],
  "analogous-color-generator": [
    "complementary-color-generator",
    "triadic-color-generator",
    "monochromatic-palette-generator",
    "color-palette-generator",
  ],
  "triadic-color-generator": [
    "complementary-color-generator",
    "split-complementary-generator",
    "analogous-color-generator",
    "color-palette-generator",
  ],
  "split-complementary-generator": [
    "complementary-color-generator",
    "triadic-color-generator",
    "analogous-color-generator",
    "color-palette-generator",
  ],
  "monochromatic-palette-generator": [
    "color-shades-generator",
    "color-tint-generator",
    "color-palette-generator",
    "analogous-color-generator",
  ],
  "random-color-generator": [
    "color-picker",
    "color-palette-generator",
    "color-name-finder",
    "css-color-generator",
  ],
  "color-contrast-checker": [
    "wcag-contrast-checker",
    "color-blindness-simulator",
    "color-picker",
    "css-color-generator",
  ],
  "wcag-contrast-checker": [
    "color-contrast-checker",
    "color-blindness-simulator",
    "color-picker",
    "css-color-generator",
  ],
  "color-blindness-simulator": [
    "color-contrast-checker",
    "wcag-contrast-checker",
    "color-palette-generator",
    "color-picker",
  ],
  "image-color-palette-extractor": [
    "dominant-color-extractor",
    "color-palette-generator",
    "color-name-finder",
    "color-picker",
  ],
  "dominant-color-extractor": [
    "image-color-palette-extractor",
    "color-palette-generator",
    "color-name-finder",
    "color-picker",
  ],
  "color-name-finder": [
    "tailwind-color-converter",
    "color-picker",
    "css-color-generator",
    "hex-to-rgb",
  ],
  "color-temperature-tool": [
    "color-picker",
    "color-palette-generator",
    "color-name-finder",
    "css-color-generator",
  ],
  "css-color-generator": [
    "color-picker",
    "css-gradient-generator",
    "tailwind-color-converter",
    "color-converter",
  ],
  "tailwind-color-converter": [
    "css-color-generator",
    "color-name-finder",
    "hex-to-rgb",
    "color-picker",
  ],
  "ideal-weight-calculator": [
    "bmi-calculator",
    "bmr-calculator",
    "calorie-calculator",
    "body-fat-calculator",
  ],
  "cagr-calculator": [
    "compound-interest-calculator",
    "sip-calculator",
    "fd-calculator",
    "simple-interest-calculator",
  ],
  "find-and-replace": [
    "case-converter",
    "word-counter",
    "text-reverser",
    "slug-generator",
  ],
  "unix-timestamp-converter": [
    "time-zone-converter",
    "date-difference-calculator",
    "time-calculator",
    "age-calculator",
  ],
  "webp-to-jpg": [
    "png-to-jpg",
    "jpg-to-pdf",
    "png-to-pdf",
    "pdf-to-jpg",
  ],
  "color-mixer": [
    "color-palette-generator",
    "complementary-color-generator",
    "gradient-generator",
    "color-picker",
  ],
};

export function getRelatedTools(slug: string, limit = 4) {
  const preferred = relatedBySlug[slug];
  if (preferred) return getToolsBySlugs(preferred).slice(0, limit);
  const tool = getTool(slug);
  if (!tool) return [];
  return tools
    .filter((item) => item.category === tool.category && item.slug !== slug)
    .slice(0, limit);
}
