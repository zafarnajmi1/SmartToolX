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
    articleTitle: extras.articleTitle ?? `How this ${name.toLowerCase()} works`,
    paragraphs: extras.paragraphs ?? [
      `People looking for a ${kw} can use this page without making an account. The ${name.toLowerCase()} runs in your browser and shows a result as soon as the fields make sense.`,
      `Enter your values above. Most SmartToolX tools keep the numbers on your device. Live currency rates and QR images are the exceptions because they need a short network request.`,
      `Use the result for everyday checks. For medical, legal, or large money decisions, confirm with a professional. The tool stays free if you want to bookmark it.`,
    ],
    faqs: extras.faqs ?? [
      {
        q: `How do I use this ${name}?`,
        a: `Fill in the fields above. The result updates as you type. Empty fields stay blank until you enter a valid number or text.`,
      },
      {
        q: `Is the ${name} free?`,
        a: `Yes. Every SmartToolX calculator and converter is free. There is no paywalled result.`,
      },
      {
        q: `Does this ${name} save my data?`,
        a: `No. Inputs stay in your browser unless a tool needs a public API, such as live currency rates or QR image rendering.`,
      },
      {
        q: `How accurate is this ${name}?`,
        a: `We use the same published formulas you would expect from a standard ${name.toLowerCase()}. Always double-check medical, legal, or large money decisions.`,
      },
    ],
  };
}

const custom: Record<string, Partial<ToolContent>> = {
  "bmi-calculator": {
    keyword: "BMI calculator",
    articleTitle: "How to check BMI online",
    paragraphs: [
      "Use this free BMI calculator online to check body mass index from height and weight. The page uses the WHO formula: weight in kilograms divided by height in metres squared.",
      "Adult categories: under 18.5 underweight, 18.5 to 24.9 normal, 25 to 29.9 overweight, 30 and above obese. BMI is a screening number, not a diagnosis. Athletes and older adults may need extra context from a clinician.",
      "No account needed. Choose height in centimeters, meters, feet and inches, or inches. Choose weight in kilograms, pounds, or stone. Mix units if that is how you know your numbers, then click Calculate BMI.",
    ],
    faqs: [
      {
        q: "What BMI range is considered healthy?",
        a: "A BMI between 18.5 and 24.9 is generally considered a healthy weight range for most adults.",
      },
      {
        q: "Which height and weight units can I use?",
        a: "Height: centimeters, meters, feet and inches, or inches. Weight: kilograms, pounds, stone, or stone and pounds. You can mix them, for example 5 ft 10 in and 75 kg.",
      },
      {
        q: "Is BMI accurate for everyone?",
        a: "Not always. BMI can overestimate body fat in muscular people and underestimate it in older adults who have lost muscle mass. It is a general screening tool, not a full health assessment.",
      },
      {
        q: "How often should I check my BMI?",
        a: "Checking every few months is enough for most people tracking general health trends over time.",
      },
    ],
  },
  "loan-emi-calculator": {
    keyword: "EMI calculator",
    articleTitle: "How loan EMI is calculated",
    paragraphs: [
      "This free EMI calculator online shows the monthly loan payment. Equated monthly installment uses EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r is the monthly rate and n is the number of months.",
      "Enter loan amount, annual interest, and tenure. You get the monthly EMI and total payable. Compare offers before you sign.",
      "This EMI calculator runs locally. It does not replace a bank quote, but it matches the standard reducing-balance formula used across home, car, and personal loans.",
    ],
  },
  "percentage-calculator": {
    keyword: "percentage calculator",
    articleTitle: "How to find a percentage of a number",
    paragraphs: [
      "Use this free percentage calculator online to find what is X percent of Y, plus the increased total after adding a percent.",
      "Formula: (value × percent) / 100. Use it for discounts, tax, exam scores, and growth.",
      "Results update as you type. Combine with the discount calculator or GST calculator when you are shopping or invoicing.",
    ],
  },
  "calorie-calculator": {
    keyword: "calorie calculator",
    articleTitle: "How daily calorie needs are estimated",
    paragraphs: [
      "A calorie calculator estimates TDEE: calories to maintain weight given age, sex, height, weight, and activity. We use Mifflin-St Jeor BMR times an activity factor, the same approach used by many nutrition tools.",
      "Height can be centimeters, meters, feet and inches, or inches. Weight can be kilograms, pounds, or stone. Mix units if that is how you know your numbers. Activity is written in plain language so you can pick the closest match.",
      "This is informational. Needs vary with muscle mass, hormones, and health conditions. A cut of about 500 kcal a day is a common starting point for gradual fat loss only with medical guidance.",
    ],
    faqs: [
      {
        q: "Which units can I use?",
        a: "Height: centimeters, meters, feet and inches, or inches. Weight: kilograms, pounds, stone, or stone and pounds. Age is in years. You can mix units, for example 5 ft 10 in and 75 kg.",
      },
      {
        q: "What does the activity level mean?",
        a: "Sedentary is desk work with little exercise. Light is 1 to 3 days a week. Moderate is 3 to 5 days. Active is 6 to 7 days. Very active is hard training or a physical job.",
      },
      {
        q: "Is this the same as BMR?",
        a: "BMR is calories at rest. This calorie calculator multiplies BMR by your activity level to estimate daily maintenance calories (TDEE).",
      },
    ],
  },
  "currency-converter": {
    keyword: "currency converter",
    articleTitle: "How live currency conversion works here",
    paragraphs: [
      "This free live currency converter is built for travelers and freelancers who need a mid-market figure. Rates refresh from a public FX feed about once a minute.",
      "Pick an amount, the currency you have, and the currency you want. The lists show full names, with common currencies at the top. USD, EUR, GBP, INR, and 160+ other codes are included.",
      "Mid-market rates can differ from what a bank or card charges. Check the Rate line for the raw multiplier.",
    ],
  },
  "word-counter": {
    keyword: "word counter",
    articleTitle: "Count words, characters, and reading time",
    paragraphs: [
      "This free word counter online counts words, characters, and reading time as you type. Built for essays, captions, and SEO briefs at 200 words per minute.",
      "Paste text above. Counts update as you type. No upload and no account.",
      "Use it with the case converter and slug generator when you publish.",
    ],
  },
  "unit-converter": {
    keyword: "unit converter",
    articleTitle: "Convert length, weight, volume, and more",
    paragraphs: [
      "Common searches include km to miles, kg to lbs, and Celsius to Fahrenheit. This converter also covers area, speed, time, data, pressure, energy, power, and angle.",
      "Pick a type, amount, from, and to. Conversion uses standard SI factors.",
      "If you only need temperature, the Temperature Converter page is a shorter path for that search.",
    ],
  },
  "pdf-to-word": {
    keyword: "PDF to Word converter",
    articleTitle: "Free PDF to Word converter online",
    paragraphs: [
      "Use this free PDF to Word converter to turn a PDF into an editable Word file without uploading it to a server. Convert PDF to Word online free and download a DOCX.",
      "Drop a PDF above, click Convert to Word, then download the .docx file. No signup.",
      "Scanned image-only PDFs may return little text. Use PDF to JPG if you need page images instead.",
    ],
    faqs: [
      {
        q: "Is this PDF to Word converter free?",
        a: "Yes. You can convert PDF to Word online free. There is no paywall.",
      },
      {
        q: "Do I need to sign up?",
        a: "No. Open the page, drop a PDF, and download the Word file.",
      },
      {
        q: "Are my files uploaded?",
        a: "No. Conversion runs in your browser. Files are not sent to a server.",
      },
      {
        q: "Will my formatting stay the same?",
        a: "Text is preserved. Complex layouts, tables, and images are simplified in the Word file.",
      },
    ],
  },
  "word-to-pdf": {
    keyword: "Word to PDF converter",
    articleTitle: "Free Word to PDF converter online",
    paragraphs: [
      "Convert Word to PDF online free. Drop a .docx file and download a PDF you can send or print. No account.",
      "The conversion runs locally in your browser.",
      "Older .doc files are not supported. Save as .docx in Word first.",
    ],
    faqs: [
      {
        q: "Is Word to PDF free?",
        a: "Yes. This Word to PDF converter is free and does not require signup.",
      },
      {
        q: "Are my files uploaded?",
        a: "No. The file stays in your browser.",
      },
    ],
  },
  "pdf-to-jpg": {
    keyword: "PDF to JPG converter",
    articleTitle: "Free PDF to JPG converter online",
    paragraphs: [
      "Convert PDF to JPG online free. Export every page as a JPEG. Multi-page files download as a zip.",
      "Drop a PDF above and click Convert to JPG. No signup.",
      "Pages render in your browser at 2× for a sharp download.",
    ],
  },
  "jpg-to-pdf": {
    keyword: "JPG to PDF converter",
    articleTitle: "Free JPG to PDF converter online",
    paragraphs: [
      "Convert JPG to PDF online free. Combine photos or PNG images into one PDF. Files stay on your device.",
      "Drop images above and click Convert to PDF.",
      "Each image becomes its own page at original size.",
    ],
  },
  "excel-to-pdf": {
    keyword: "Excel to PDF converter",
    articleTitle: "Free Excel to PDF converter online",
    paragraphs: [
      "Convert Excel to PDF online free. Turn an XLSX or CSV spreadsheet into a print-ready PDF in your browser.",
      "Drop a file above and click Convert to PDF.",
      "Cell values are laid out as readable text in the PDF.",
    ],
  },
  "ppt-to-pdf": {
    keyword: "PPT to PDF converter",
    articleTitle: "Free PPT to PDF converter online",
    paragraphs: [
      "Convert PPT to PDF online free. Upload a PowerPoint .ppt or .pptx file and download a shareable PDF. No signup.",
      "Drop your slides above and click Convert to PDF.",
      "Slide layouts are processed in your browser so the file stays on your device.",
    ],
  },
  "compress-pdf": {
    keyword: "compress PDF online",
    articleTitle: "Compress PDF online free",
    paragraphs: [
      "Compress PDF online free to reduce file size for email and uploads. The file is rewritten in your browser and is not uploaded.",
      "Drop a PDF above and click Compress File.",
      "How much it shrinks depends on how the original was saved. Text stays sharp.",
    ],
    faqs: [
      {
        q: "Is compress PDF free?",
        a: "Yes. You can compress PDF online free with no account.",
      },
      {
        q: "Will the quality be affected?",
        a: "Text stays fully sharp. The file is rewritten. Image-heavy PDFs may shrink more than text-only files.",
      },
      {
        q: "Are my files kept private?",
        a: "Yes. Compression runs in your browser. Files are not uploaded.",
      },
    ],
  },
  "merge-pdf": {
    keyword: "merge PDF",
    articleTitle: "Merge PDF online free",
    paragraphs: [
      "Merge PDF files online free. Combine multiple PDFs into one document in the order you add them. No signup.",
      "Drop files above, remove any you do not need, then click Merge Files.",
      "Each file can be up to 25MB. You can merge up to 20 files at once.",
    ],
    faqs: [
      {
        q: "Is merge PDF free?",
        a: "Yes. You can combine PDF files online free.",
      },
      {
        q: "Can I reorder the files before merging?",
        a: "Remove and re-add files in the order you want. Pages keep each file’s original order.",
      },
      {
        q: "Are my files kept private?",
        a: "Yes. Merging runs in your browser. Files are not uploaded.",
      },
    ],
  },
  "pdf-to-png": {
    keyword: "PDF to PNG converter",
    articleTitle: "Free PDF to PNG converter online",
    paragraphs: [
      "Convert PDF to PNG online free. Export each page as a sharp PNG. Multi-page files download as a zip.",
      "Drop a PDF above and click Convert to PNG.",
      "PNG keeps sharp edges, which helps for slides and screenshots.",
    ],
  },
  "png-to-pdf": {
    keyword: "PNG to PDF converter",
    articleTitle: "Free PNG to PDF converter online",
    paragraphs: [
      "Convert PNG to PDF online free. Combine one or more PNG images into a single PDF.",
      "Drop PNG files above and click Convert to PDF.",
      "Each image becomes its own page at original size.",
    ],
  },
  "date-difference-calculator": {
    keyword: "date difference calculator",
    articleTitle: "Find the time between two dates",
    paragraphs: [
      "This calculator answers how much time sits between two calendar dates: years, months, weeks, and total days.",
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
  "age-calculator": {
    keyword: "age calculator",
    articleTitle: "Find exact age from a date of birth",
    paragraphs: [
      "Use this free age calculator online to see exact age in years, months, and days from a date of birth.",
      "Useful for forms, school records, and quick checks. It does not store the date you type.",
      "If you need the gap between two other dates, use the Date Difference Calculator instead.",
    ],
  },
  "qr-code-generator": {
    keyword: "QR code generator",
    articleTitle: "Create a QR code from a link or text",
    paragraphs: [
      "Paste a URL or short message and this page draws a scannable QR code. Download the image for print or screens.",
      "Keep the text reasonably short so phones can scan it cleanly.",
      "The encoded content is used only to draw the image. There is no SmartToolX account involved.",
    ],
  },
  "bmr-calculator": {
    keyword: "BMR calculator",
    articleTitle: "Estimate basal metabolic rate",
    paragraphs: [
      "BMR is a rough estimate of the calories your body uses at rest. This page uses the Mifflin-St Jeor formula from age, sex, height, and weight.",
      "Enter age in years. Height can be centimeters, meters, feet and inches, or inches. Weight can be kilograms, pounds, or stone. Mix units if that is how you know your numbers.",
      "It is a starting point, not a lab measurement. Muscle mass and health conditions can move the real number. For daily calories including activity, open the Calorie Calculator next.",
    ],
    faqs: [
      {
        q: "Which units can I use for BMR?",
        a: "Height: centimeters, meters, feet and inches, or inches. Weight: kilograms, pounds, stone, or stone and pounds. Age is in years. You can mix units, for example 5 ft 10 in and 75 kg.",
      },
      {
        q: "What does BMR mean?",
        a: "Basal metabolic rate is an estimate of the calories your body would use at rest. It does not include walking, work, or exercise.",
      },
      {
        q: "Which formula does this calculator use?",
        a: "Mifflin-St Jeor. Weight is converted to kilograms and height to centimeters before the formula runs.",
      },
    ],
  },
  "body-fat-calculator": {
    keyword: "body fat calculator",
    articleTitle: "Estimate body fat percentage",
    paragraphs: [
      "This estimate uses the Deurenberg method from BMI, age, and sex. It is a screening figure, not a DEXA or caliper test.",
      "Enter the fields above to see a percentage. Athletes and older adults often need a clinician’s view as well.",
      "Pair it with the BMI calculator if you want the underlying index too.",
    ],
  },
  "pregnancy-due-date-calculator": {
    keyword: "due date calculator",
    articleTitle: "Estimate a pregnancy due date",
    paragraphs: [
      "Enter the first day of your last period. The estimate uses Naegele’s rule of 280 days.",
      "This is informational only. A clinician confirms dating with history and, when needed, ultrasound.",
      "Cycle length and ovulation timing can shift the real due date.",
    ],
  },
  "ovulation-calculator": {
    keyword: "ovulation calculator",
    articleTitle: "Estimate ovulation and the fertile window",
    paragraphs: [
      "Enter cycle length and the first day of your last period to see an ovulation day and fertile window.",
      "This is a calendar estimate. It does not replace ovulation tests or medical advice.",
      "Irregular cycles can make the window less reliable.",
    ],
  },
  "water-intake-calculator": {
    keyword: "water intake calculator",
    articleTitle: "Get a daily water goal from body weight",
    paragraphs: [
      "This guide uses about 35 ml of water per kilogram of body weight. It is a simple starting point, not a medical prescription.",
      "Heat, exercise, and health conditions can raise or lower what you actually need.",
      "Enter weight above to see a daily litre target.",
    ],
  },
  "compound-interest-calculator": {
    keyword: "compound interest calculator",
    articleTitle: "See how compound interest grows a balance",
    paragraphs: [
      "Enter a starting amount, annual interest percent, time in years, and how often interest is added. The result uses A = P(1 + r/n)^(nt).",
      "Useful for savings accounts, deposits, and long-term planning. Fees and taxes are not included.",
      "For monthly investing, try the SIP calculator.",
    ],
  },
  "gst-calculator": {
    keyword: "GST calculator",
    articleTitle: "Add or remove GST and VAT",
    paragraphs: [
      "Use this free GST calculator online to add GST to a price or take GST out of a price that already includes tax. Enter the amount and the tax percent.",
      "Works the same way for VAT in many countries. Confirm the rate that applies to your invoice.",
      "For a simple percent of a number, the Percentage Calculator is quicker.",
    ],
  },
  "tip-calculator": {
    keyword: "tip calculator",
    articleTitle: "Split a bill with tip",
    paragraphs: [
      "Enter the bill amount, tip percent, and how many people are paying. Total tip is the tip on the whole bill. Each person pays is the bill plus tip, split evenly.",
      "Handy at restaurants when you want a clean split.",
      "If you only need a percent of a number, use the Percentage Calculator.",
    ],
  },
  "discount-calculator": {
    keyword: "discount calculator",
    articleTitle: "Find the sale price and amount saved",
    paragraphs: [
      "Enter the original price and discount percent. You see how much you save and what you pay.",
      "Useful in shops, on invoices, and when comparing offers.",
      "Stack it with the GST calculator if tax sits on top of the sale price.",
    ],
  },
  "sip-calculator": {
    keyword: "SIP calculator",
    articleTitle: "Estimate SIP future value",
    paragraphs: [
      "This free SIP calculator online estimates mutual fund SIP maturity. Enter a monthly amount, expected annual return, and number of years.",
      "Markets vary. This is a formula, not a promise of returns.",
      "For a one-time deposit, the Compound Interest Calculator may fit better.",
    ],
  },
  "simple-interest-calculator": {
    keyword: "simple interest calculator",
    articleTitle: "Calculate simple interest on a loan",
    paragraphs: [
      "Simple interest is principal × rate × time. This page also shows the total payable.",
      "Common for short-term loans where interest does not compound.",
      "For compounding, switch to the Compound Interest Calculator.",
    ],
  },
  "case-converter": {
    keyword: "case converter",
    articleTitle: "Change text to upper, lower, or title case",
    paragraphs: [
      "Paste text and switch it to UPPERCASE, lowercase, Title Case, or sentence case.",
      "Built for headlines, captions, and messy drafts. Copy the result when it looks right.",
      "Nothing is stored after you leave the page.",
    ],
  },
  "password-generator": {
    keyword: "password generator",
    articleTitle: "Create a random password in your browser",
    paragraphs: [
      "Pick a length and character mix, then generate a password on this page. The value is created on your device.",
      "Store it in a password manager. We do not save what you generate.",
      "Longer passwords with mixed characters are harder to guess.",
    ],
  },
  "lorem-ipsum-generator": {
    keyword: "lorem ipsum generator",
    articleTitle: "Generate placeholder text for layouts",
    paragraphs: [
      "Get classic lorem ipsum paragraphs for wireframes and draft pages.",
      "Choose how much text you need, then copy it into your layout.",
      "This is dummy text only. It does not mean anything.",
    ],
  },
  "text-reverser": {
    keyword: "reverse text",
    articleTitle: "Reverse letters or words in a sentence",
    paragraphs: [
      "Paste any block of text and reverse the characters or the word order.",
      "Useful for puzzles, checks, and quick edits.",
      "The original text never leaves your browser.",
    ],
  },
  "base64-encoder": {
    keyword: "Base64 encoder",
    articleTitle: "Encode or decode Base64 text",
    paragraphs: [
      "Paste text to encode it as Base64, or paste Base64 to decode it back.",
      "Handy for tokens, data URLs, and debugging. Work stays on your device.",
      "Large files belong in a dedicated encoder. This page is for text.",
    ],
  },
  "slug-generator": {
    keyword: "slug generator",
    articleTitle: "Turn a title into a URL slug",
    paragraphs: [
      "Paste a page title and get a lowercase, hyphenated slug you can use in a URL.",
      "Built for blogs, docs, and CMS permalinks.",
      "Edit the result if you want a shorter keyword-focused slug.",
    ],
  },
  "temperature-converter": {
    keyword: "temperature converter",
    articleTitle: "Convert Celsius, Fahrenheit, and Kelvin",
    paragraphs: [
      "Enter a temperature and pick the from and to units. The page uses the standard conversion formulas.",
      "Built for cooking, weather, and homework.",
      "For other measurements, open the Unit Converter.",
    ],
  },
  "number-to-words": {
    keyword: "number to words",
    articleTitle: "Spell out a number in English",
    paragraphs: [
      "Type a number and see it written in words. Useful for cheques, invoices, and formal writing.",
      "The wording follows common English for whole numbers.",
      "Currency names are not added. Append “only” or a currency yourself if you need that style.",
    ],
  },
  "binary-converter": {
    keyword: "binary converter",
    articleTitle: "Convert decimal, binary, and hex",
    paragraphs: [
      "Enter a value in one base and see decimal, binary, and hexadecimal together.",
      "Built for classwork and quick checks. Invalid input is ignored until the number is clean.",
      "This is integer conversion, not floating-point.",
    ],
  },
  "color-converter": {
    keyword: "color converter",
    articleTitle: "Convert HEX colors to RGB",
    paragraphs: [
      "Paste a HEX code to get RGB, or the other way around. Copy whichever format your CSS or design tool needs.",
      "Accepts common 6-digit hex values.",
      "This is a format converter, not a full palette tool.",
    ],
  },
  "roman-numeral-converter": {
    keyword: "Roman numeral converter",
    articleTitle: "Convert numbers to Roman numerals",
    paragraphs: [
      "Enter a number from 1 to 3999 to see the Roman numeral form.",
      "Useful for dates, outlines, and clock faces.",
      "Numbers outside that range are not part of the usual Roman set this page uses.",
    ],
  },
  "time-calculator": {
    keyword: "time calculator",
    articleTitle: "Add hours, minutes, and seconds",
    paragraphs: [
      "Enter hours, minutes, and seconds to get a total duration, including a breakdown back into h, m, and s.",
      "Useful for logs, workouts, and video lengths.",
      "This adds clock time. It does not convert time zones.",
    ],
  },
};

export function getToolContent(slug: string): ToolContent | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return guide(tool, custom[slug] ?? {});
}
