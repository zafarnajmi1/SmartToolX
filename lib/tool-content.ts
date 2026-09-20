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
  "split-pdf": {
    keyword: "split PDF",
    articleTitle: "Split PDF online free",
    paragraphs: [
      "Split PDF online free. Each page is saved as its own PDF. Files with more than one page download as a zip.",
      "Drop a PDF above and click Split File.",
      "Each file can be up to 25MB. Conversion runs in your browser.",
    ],
    faqs: [
      {
        q: "Is split PDF free?",
        a: "Yes. You can split PDF online free with no account.",
      },
      {
        q: "What do I download?",
        a: "A one-page PDF downloads as a single file. Multi-page PDFs download as a zip with one PDF per page.",
      },
      {
        q: "Are my files kept private?",
        a: "Yes. Splitting runs in your browser. Files are not uploaded.",
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
  "period-calculator": {
    keyword: "period calculator",
    articleTitle: "Estimate your next period dates",
    paragraphs: [
      "Use this free period calculator online to estimate the next period from the first day of your last period and your cycle length.",
      "The page adds your cycle length to that start date. The expected end assumes a 5-day period. This is a calendar estimate, not medical advice.",
      "Irregular cycles can shift the real dates. For ovulation timing, use the Ovulation Calculator.",
    ],
    faqs: [
      {
        q: "How do I use this period calculator?",
        a: "Enter the first day of your last period and your usual cycle length in days. The next period start, expected end, and the period after that appear on the right.",
      },
      {
        q: "Is the period calculator free?",
        a: "Yes. You can use this period calculator online free with no account.",
      },
      {
        q: "Does this save my dates?",
        a: "No. Dates stay in your browser.",
      },
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
  "fd-calculator": {
    keyword: "FD calculator",
    articleTitle: "Estimate fixed deposit maturity",
    paragraphs: [
      "This free FD calculator online estimates bank fixed deposit maturity. Enter the deposit amount, annual interest percent, and tenure in years.",
      "Interest is compounded quarterly, which matches many bank FDs. Tax and premature withdrawal rules are not included.",
      "For a monthly investment plan, use the SIP calculator.",
    ],
    faqs: [
      {
        q: "How is FD interest calculated here?",
        a: "The page uses quarterly compounding: A = P(1 + r/4)^(4t). P is the deposit, r is the annual rate as a decimal, and t is years.",
      },
      {
        q: "Is the FD calculator free?",
        a: "Yes. You can use this FD calculator online free with no account.",
      },
      {
        q: "Does this include tax on FD interest?",
        a: "No. The result is the gross maturity amount before tax.",
      },
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
  "json-formatter": {
    keyword: "JSON formatter",
    articleTitle: "Beautify or minify JSON online",
    paragraphs: [
      "Paste JSON and switch between beautify and minify. Formatting runs in your browser.",
      "Invalid JSON shows an error until the text is valid.",
      "Nothing is uploaded. Copy the result when it looks right.",
    ],
    faqs: [
      {
        q: "Is this JSON formatter free?",
        a: "Yes. You can format JSON online free with no account.",
      },
      {
        q: "Does my JSON leave the browser?",
        a: "No. Beautify and minify run on your device.",
      },
      {
        q: "What if my JSON is invalid?",
        a: "The result shows Invalid JSON until the input can be parsed.",
      },
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
  "time-zone-converter": {
    keyword: "time zone converter",
    articleTitle: "Convert a time between time zones",
    paragraphs: [
      "Pick a date and time, then choose the from and to time zones. The converted clock time appears on the right.",
      "Zones include UTC, Pakistan, India, UAE, UK, US, and more. DST is handled by the browser time zone data.",
      "For adding hours and minutes, use the Time Calculator.",
    ],
    faqs: [
      {
        q: "Is this time zone converter free?",
        a: "Yes. You can convert time zones online free with no account.",
      },
      {
        q: "Does it handle daylight saving?",
        a: "Yes. The converted time uses the zone rules in your browser, including daylight saving where it applies.",
      },
      {
        q: "Which time zones are included?",
        a: "Both dropdowns list every IANA time zone, including UTC and regions in Africa, the Americas, Asia, Europe, Australia, and the Pacific.",
      },
    ],
  },
  "sleep-calculator": {
    keyword: "sleep calculator",
    articleTitle: "How this sleep calculator finds bedtime and wake time",
    paragraphs: [
      "Use this free sleep calculator online to plan bedtime or wake-up time around 90-minute sleep cycles. Most people fall asleep in about 15 minutes, then move through light, deep, and REM sleep in each cycle.",
      "Pick Find bedtime from wake time if you know when you must get up. Pick Find wake time from bedtime if you know when you can go to sleep. The page shows 6, 5, and 4 cycle options so you can choose about 9, 7.5, or 6 hours of sleep.",
      "This sleep cycle calculator is a planning aid, not medical advice. Teens, shift workers, and people with sleep disorders may need a different schedule. Pair it with the age calculator only for general health tracking.",
    ],
    faqs: [
      {
        q: "How does this sleep calculator work?",
        a: "It adds 15 minutes to fall asleep, then counts 90-minute sleep cycles. You get three suggested times for 6, 5, and 4 cycles.",
      },
      {
        q: "Is this sleep calculator free?",
        a: "Yes. This bedtime and wake time calculator is free. There is no account or paywall.",
      },
      {
        q: "How many hours of sleep should I get?",
        a: "Many adults feel better with 7 to 9 hours. That is usually 5 or 6 complete 90-minute cycles plus time to fall asleep.",
      },
      {
        q: "Does the sleep calculator save my times?",
        a: "No. Wake time and bedtime stay in your browser.",
      },
    ],
  },
  "mortgage-calculator": {
    keyword: "mortgage calculator",
    articleTitle: "How monthly mortgage payment is calculated",
    paragraphs: [
      "This free mortgage calculator online shows the monthly home loan payment from home price, down payment, annual interest, and loan term. The loan amount is price minus down payment. The payment uses the standard amortizing formula also used by a mortgage payment calculator at a bank.",
      "You also see total payable and total interest over the full term. A 30-year mortgage keeps the monthly payment lower and the interest higher. A 15-year term does the opposite.",
      "This house payment calculator does not include property tax, homeowners insurance, or PMI. Use it to compare offers, then confirm the figure with your lender. For India-style reducing-balance loans without a down-payment field, use the EMI calculator.",
    ],
    faqs: [
      {
        q: "How do I use this mortgage calculator?",
        a: "Enter home price, down payment, annual interest percent, and loan term in years. Monthly payment, total payable, and total interest update on the right.",
      },
      {
        q: "Is this mortgage calculator free?",
        a: "Yes. The mortgage payment calculator is free and does not require an account.",
      },
      {
        q: "Does it include taxes and insurance?",
        a: "No. This page estimates principal and interest only. Add tax, insurance, and PMI from your lender quote.",
      },
      {
        q: "What is the mortgage payment formula?",
        a: "Monthly payment = P × r × (1+r)^n / ((1+r)^n − 1), where P is the loan after down payment, r is the monthly rate, and n is the number of months.",
      },
    ],
  },
  "random-number-generator": {
    keyword: "random number generator",
    articleTitle: "How this random number generator works",
    paragraphs: [
      "This free random number generator online picks integers between a minimum and a maximum, including popular ranges such as 1 to 100. Set how many numbers you need, then click Generate.",
      "Numbers come from the browser’s cryptographic random source, not a predictable sequence. You can generate up to 100 values at once. Duplicates can appear because each draw is independent.",
      "Use the number generator for giveaways, classroom picks, dice-style games, and sampling. It is not a lottery or gambling service. Pair it with the password generator when you need random characters instead of numbers.",
    ],
    faqs: [
      {
        q: "How do I generate a random number from 1 to 100?",
        a: "Set minimum to 1, maximum to 100, how many to 1, then click Generate. This random number generator 1-100 run stays in your browser.",
      },
      {
        q: "Is this random number generator free?",
        a: "Yes. The RNG online tool is free. There is no signup.",
      },
      {
        q: "Can I generate more than one number?",
        a: "Yes. Set How many to any value from 1 to 100. Results appear as a comma-separated list.",
      },
      {
        q: "Are the numbers truly random?",
        a: "They use crypto.getRandomValues in your browser. That is strong enough for everyday picking. It is not a certified lottery draw.",
      },
    ],
  },
  "gpa-calculator": {
    keyword: "GPA calculator",
    articleTitle: "How to calculate GPA and convert CGPA to percentage",
    paragraphs: [
      "This free GPA calculator online covers the searches students actually type: GPA from credit hours, percentage to 4.0 GPA, CGPA to percentage, and percentage to CGPA. Grade point average is total grade points divided by total credit hours.",
      "CGPA to percentage on a 10-point scale uses the common CBSE-style rule: percentage = CGPA × 9.5. On a 4-point scale, percentage = (CGPA / 4) × 100. Percentage to GPA (4.0) uses a linear map of percentage / 25, so 100% is 4.0 and 75% is 3.0.",
      "Universities publish their own conversion tables. Use this college GPA calculator for a quick check, then follow your registrar’s chart for official transcripts. Related tools include the percentage calculator and number to words converter.",
    ],
    faqs: [
      {
        q: "How do I calculate GPA from credits?",
        a: "Add your total grade points, add total credit hours, and divide points by credits. Example: 36 points and 12 credits is a 3.00 GPA.",
      },
      {
        q: "How do I convert CGPA to percentage?",
        a: "On a 10-point scale this GPA calculator uses percentage = CGPA × 9.5. On a 4-point scale it uses (CGPA / 4) × 100.",
      },
      {
        q: "Is this GPA calculator free?",
        a: "Yes. GPA calculator, CGPA calculator, and CGPA to percentage conversion are free with no account.",
      },
      {
        q: "Is percentage to 4.0 GPA official?",
        a: "No. The 4.0 conversion here is a simple linear estimate (percentage / 25). Your college may use letter-grade cutoffs instead.",
      },
    ],
  },
  "png-to-jpg": {
    keyword: "PNG to JPG converter",
    articleTitle: "Convert PNG to JPG online free",
    paragraphs: [
      "Use this free PNG to JPG converter to turn PNG images into JPEG without uploading them. Convert PNG to JPG online free and download a .jpg file, or several images as a zip.",
      "Drop one or more PNG files above, click Convert to JPG, then download. Transparent PNG areas become white in the JPEG because JPG has no alpha channel.",
      "Conversion runs in your browser. No signup. If you need a PDF instead, use PNG to PDF. If you need page images from a document, use PDF to JPG.",
    ],
    faqs: [
      {
        q: "Is this PNG to JPG converter free?",
        a: "Yes. You can convert PNG to JPG online free. There is no paywall.",
      },
      {
        q: "Do I need to sign up?",
        a: "No. Open the page, drop a PNG, and download the JPG.",
      },
      {
        q: "Are my images uploaded?",
        a: "No. PNG to JPEG conversion runs in your browser. Files are not sent to a server.",
      },
      {
        q: "Will transparent PNG stay transparent?",
        a: "No. JPEG does not support transparency. Transparent pixels are filled with white.",
      },
    ],
  },
};

export function getToolContent(slug: string): ToolContent | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return guide(tool, custom[slug] ?? {});
}
