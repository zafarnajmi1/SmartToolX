import { getTool, type Tool } from "@/lib/tools";

export type FaqItem = { q: string; a: string };

export type ToolContent = {
  keyword: string;
  articleTitle: string;
  paragraphs: string[];
  faqs: FaqItem[];
};

function guide(tool: Tool, extras: Partial<ToolContent> = {}): ToolContent {
  const name = tool.name;
  const kw = extras.keyword ?? `free ${name.toLowerCase()} online`;
  return {
    keyword: kw,
    articleTitle:
      extras.articleTitle ?? `Free ${name} Online — Instant, Accurate, No Sign-up`,
    paragraphs: extras.paragraphs ?? [
      `Searchers looking for a ${kw} land here because the ${name.toLowerCase()} runs in your browser and returns a result immediately. There is no account wall and no app to install.`,
      `Enter your values above. SmartToolX uses standard formulas so you can check BMI, payments, conversions, or text counts without sending numbers to a server (currency rates and QR images are the exceptions).`,
      `Use this ${name.toLowerCase()} for everyday decisions, then verify anything high-stakes with a professional. Bookmark the page if you use this keyword search often — the tool stays free.`,
    ],
    faqs: extras.faqs ?? [
      {
        q: `How do I use this ${name}?`,
        a: `Fill in the fields above. The result updates as you type. Empty fields show a dash until you enter a valid number or text.`,
      },
      {
        q: `Is the ${name} free?`,
        a: `Yes. Every SmartToolX calculator and converter is free, with no sign-up and no paywalled result.`,
      },
      {
        q: `Does this ${name} save my data?`,
        a: `No. Inputs stay in your browser unless a tool needs a public API, such as live currency rates or QR image rendering.`,
      },
      {
        q: `Is this ${name} accurate enough for Google-style “best calculator” searches?`,
        a: `We use the same published formulas people expect from a top-ranked ${name.toLowerCase()}. Always double-check medical, legal, or large-money decisions.`,
      },
    ],
  };
}

const custom: Record<string, Partial<ToolContent>> = {
  "bmi-calculator": {
    keyword: "BMI calculator",
    articleTitle: "BMI Calculator — Free Body Mass Index Chart Online",
    paragraphs: [
      "A BMI calculator is one of the most searched health tools on Google. This free BMI calculator uses the WHO formula: weight (kg) divided by height (m) squared.",
      "Adult BMI categories: under 18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, 30+ obese. BMI is a screening number, not a diagnosis. Athletes and older adults may need extra context from a clinician.",
      "No sign-up. Enter height and weight above, then click Calculate BMI. Pair it with the calorie calculator and body fat calculator on SmartToolX for a fuller picture.",
    ],
    faqs: [
      {
        q: "What BMI range is considered healthy?",
        a: "A BMI between 18.5 and 24.9 is generally considered a healthy weight range for most adults.",
      },
      {
        q: "Is BMI accurate for everyone?",
        a: "Not always. BMI can overestimate body fat in muscular people and underestimate it in older adults who've lost muscle mass. It's a general screening tool, not a full health assessment.",
      },
      {
        q: "How often should I check my BMI?",
        a: "Checking every few months is enough for most people tracking general health trends over time.",
      },
    ],
  },
  "loan-emi-calculator": {
    keyword: "EMI calculator",
    articleTitle: "EMI Calculator — Monthly Loan Payment Online",
    paragraphs: [
      "An EMI calculator is a top finance query. Equated monthly installment uses EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r is the monthly rate and n is the number of months.",
      "Enter loan amount, annual interest, and tenure. You get the monthly EMI and total payable. Compare offers before you sign.",
      "This EMI calculator runs locally. It does not replace a bank quote, but it matches the standard reducing-balance formula used across home, car, and personal loans.",
    ],
  },
  "percentage-calculator": {
    keyword: "percentage calculator",
    articleTitle: "Percentage Calculator — What Is X Percent of Y?",
    paragraphs: [
      "People search “what is 18 percent of 250” every day. This percentage calculator answers that, plus the increased total after adding a percent.",
      "Formula: (value × percent) / 100. Use it for discounts, tax, exam scores, and growth.",
      "Results update as you type. Combine with the discount calculator or GST calculator when you are shopping or invoicing.",
    ],
  },
  "calorie-calculator": {
    keyword: "calorie calculator",
    articleTitle: "Calorie Calculator — Daily Calorie Needs (TDEE)",
    paragraphs: [
      "A calorie calculator estimates TDEE: calories to maintain weight given age, sex, height, weight, and activity. We use Mifflin-St Jeor BMR times an activity factor — the same approach used by widely ranked nutrition tools.",
      "Sedentary 1.2, light 1.375, moderate 1.55, active 1.725, very active 1.9. Cut ~500 kcal/day for gradual fat loss only with medical guidance.",
      "This is informational. Needs vary with muscle mass, hormones, and health conditions.",
    ],
  },
  "currency-converter": {
    keyword: "currency converter",
    articleTitle: "Live Currency Converter — 150+ Exchange Rates",
    paragraphs: [
      "A live currency converter is a high-intent Google query for travelers and freelancers. Rates refresh from a public FX feed about once a minute.",
      "Pick amount, from, and to. USD, EUR, GBP, INR, and 160+ other codes are included.",
      "Mid-market rates can differ from what a bank or card charges. Check the Rate line for the raw multiplier.",
    ],
  },
  "word-counter": {
    keyword: "word counter",
    articleTitle: "Word Counter — Words, Characters, Reading Time",
    paragraphs: [
      "A word counter is essential for essays, captions, and SEO briefs. This live word counter tallies words, characters, and estimated reading time at 200 words per minute.",
      "Paste text above. Counts update as you type. No upload and no account.",
      "Use it with the case converter and slug generator when you publish.",
    ],
  },
  "unit-converter": {
    keyword: "unit converter",
    articleTitle: "Unit Converter — Length, Weight, Volume, Temperature",
    paragraphs: [
      "Unit converter searches cover km to miles, kg to lbs, Celsius to Fahrenheit, and more. This converter includes length, weight, volume, temperature, area, speed, time, data, pressure, energy, power, and angle.",
      "Pick a type, amount, from, and to. Conversion uses standard SI factors.",
      "For a dedicated temperature-only page, use the Temperature Converter — it ranks for that exact keyword.",
    ],
  },
  "pdf-to-word": {
    keyword: "PDF to Word converter",
    articleTitle: "PDF to Word Converter — Editable Documents in the Browser",
    paragraphs: [
      "Upload a PDF and get back an editable Word document. Text is extracted in your browser so the file is not sent to a server.",
      "Drop a PDF above, click Convert to Word, then download the .docx file.",
      "Scanned image-only PDFs may return little text. Use PDF to JPG if you need page images instead.",
    ],
    faqs: [
      { q: "Will my formatting stay the same?", a: "Text is preserved. Complex layouts, tables, and images are simplified in the Word file." },
      { q: "Is there a file size limit?", a: "Files up to 25MB are supported." },
      { q: "Are my files kept private?", a: "Yes. Conversion runs in your browser. Files are not uploaded." },
    ],
  },
  "word-to-pdf": {
    keyword: "Word to PDF converter",
    articleTitle: "Word to PDF Converter — Shareable PDFs from DOCX",
    paragraphs: [
      "Turn a Word document into a PDF you can send or print. The conversion runs locally in your browser.",
      "Drop a .docx file above and click Convert to PDF.",
      "Older .doc files are not supported — save as .docx in Word first.",
    ],
  },
  "pdf-to-jpg": {
    keyword: "PDF to JPG converter",
    articleTitle: "PDF to JPG Converter — Export Every Page as an Image",
    paragraphs: [
      "Export each PDF page as a JPG. Multi-page files download as a zip of images.",
      "Drop a PDF above and click Convert to JPG.",
      "Pages render in your browser at 2× for a sharp download.",
    ],
  },
  "jpg-to-pdf": {
    keyword: "JPG to PDF converter",
    articleTitle: "JPG to PDF Converter — Combine Images into One PDF",
    paragraphs: [
      "Combine one or more JPG or PNG images into a single PDF. Page order follows your upload order.",
      "Drop images above and click Convert to PDF.",
      "Each image becomes its own page at original size.",
    ],
  },
  "excel-to-pdf": {
    keyword: "Excel to PDF converter",
    articleTitle: "Excel to PDF Converter — Print-Ready Spreadsheets",
    paragraphs: [
      "Convert a spreadsheet into a PDF for sharing or printing. .xlsx and CSV files are supported.",
      "Drop a file above and click Convert to PDF.",
      "Cell values are laid out as readable text in the PDF.",
    ],
  },
  "ppt-to-pdf": {
    keyword: "PPT to PDF converter",
    articleTitle: "PPT to PDF Converter — Slide Decks as PDFs",
    paragraphs: [
      "Convert a PowerPoint deck into a PDF. Upload a .pptx file and download a shareable document.",
      "Drop your slides above and click Convert to PDF.",
      "Slide text is extracted in your browser. Older .ppt files should be saved as .pptx first.",
    ],
  },
  "compress-pdf": {
    keyword: "compress PDF",
    articleTitle: "Compress PDF — Smaller Files Without a Server",
    paragraphs: [
      "Rewrite a PDF with object streams to trim file size for email and uploads.",
      "Drop a PDF above and click Compress File.",
      "How much it shrinks depends on how the original was saved. Text stays sharp.",
    ],
    faqs: [
      { q: "Will the quality be affected?", a: "Text stays fully sharp. The file is rewritten; image-heavy PDFs may shrink more than text-only files." },
      { q: "How much smaller will my file be?", a: "It varies. Already-optimized PDFs may barely change. Others often drop noticeably." },
      { q: "Are my files kept private?", a: "Yes. Compression runs in your browser. Files are not uploaded." },
    ],
  },
  "merge-pdf": {
    keyword: "merge PDF",
    articleTitle: "Merge PDF — Combine Multiple PDFs into One",
    paragraphs: [
      "Upload two or more PDFs and combine them into a single document in the order you add them.",
      "Drop files above, remove any you do not need, then click Merge Files.",
      "Each file can be up to 25MB. You can merge up to 20 files at once.",
    ],
    faqs: [
      { q: "Can I reorder the files before merging?", a: "Remove and re-add files in the order you want. Pages keep each file’s original order." },
      { q: "Is there a limit on how many files I can merge?", a: "You can merge up to 20 files at once." },
      { q: "Are my files kept private?", a: "Yes. Merging runs in your browser. Files are not uploaded." },
    ],
  },
  "pdf-to-png": {
    keyword: "PDF to PNG converter",
    articleTitle: "PDF to PNG Converter — Crisp Page Images",
    paragraphs: [
      "Export each PDF page as a PNG. Multi-page files download as a zip.",
      "Drop a PDF above and click Convert to PNG.",
      "PNG keeps sharp edges, useful for slides and screenshots.",
    ],
  },
  "png-to-pdf": {
    keyword: "PNG to PDF converter",
    articleTitle: "PNG to PDF Converter — Images into One Document",
    paragraphs: [
      "Combine one or more PNG images into a single PDF. Pages follow your upload order.",
      "Drop PNG files above and click Convert to PDF.",
      "Each image becomes its own page at original size.",
    ],
  },
  "date-difference-calculator": {
    keyword: "date difference calculator",
    articleTitle: "Date Difference Calculator — Days Between Two Dates",
    paragraphs: [
      "A date difference calculator answers how much time sits between two calendar dates: years, months, weeks, and total days.",
      "Pick a start date and an end date above. The result updates as soon as both dates are valid. If the end date is earlier, the duration is still shown as a positive gap.",
      "Use it for project timelines, leave days, or the span between two events. It runs in your browser and does not save the dates you enter.",
    ],
    faqs: [
      {
        q: "How do I find the number of days between two dates?",
        a: "Enter the first date and the second date. Total days is the calendar-day count between them, and Duration breaks that into years, months, and leftover days.",
      },
      {
        q: "Does the start date have to be earlier than the end date?",
        a: "No. If you reverse the dates, the calculator still reports the same length of time.",
      },
      {
        q: "Are hours and time zones included?",
        a: "This tool compares calendar dates only, not clock time. Each date is counted as a full day in your local calendar.",
      },
    ],
  },
};

export function getToolContent(slug: string): ToolContent | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return guide(tool, custom[slug] ?? {});
}
