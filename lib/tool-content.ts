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
  "percentage-calculator": {
    keyword: "percentage calculator free",
    articleTitle: "How to calculate a percentage free",
    paragraphs: [
      "Calculate Percentage free with this percentage calculator. It finds what is X percent of Y as you type.",
      "How to calculate a percentage: enter the value and the percent above. The result updates as you type.",
      "This percentage calculator free page is built for desktop and mobile. Percentage Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate a percentage?",
        a: "Enter the value and the percent above. The result updates as you type. The percentage calculator runs in your browser.",
      },
      {
        q: "What is the percentage formula?",
        a: "Formula: (value × percent) / 100. Use it for discounts, tax, exam scores, and growth.",
      },
      {
        q: "Is the percentage calculator free?",
        a: "Yes. You can calculate percentage free with no signup and no software to install.",
      },
      {
        q: "Can I calculate percentage on mobile?",
        a: "Yes. This percentage calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "bmi-calculator": {
    keyword: "bmi calculator free",
    articleTitle: "How to check BMI free",
    paragraphs: [
      "Check BMI free with this bmi calculator. The page uses the WHO formula: weight in kilograms divided by height in metres squared. BMI is a screening number, not a diagnosis.",
      "How to check BMI: enter height and weight above, then read the BMI and category on the right.",
      "This bmi calculator free page is built for desktop and mobile. BMI Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I check BMI online?",
        a: "Enter height and weight above, then read the BMI and category on the right. Mix units if that is how you know your numbers.",
      },
      {
        q: "What BMI range is considered healthy?",
        a: "A BMI between 18.5 and 24.9 is generally considered a healthy weight range for most adults. Adult categories: under 18.5 underweight, 18.5 to 24.9 normal, 25 to 29.9 overweight, 30 and above obese.",
      },
      {
        q: "Is the bmi calculator free?",
        a: "Yes. You can check bmi free with no signup and no software to install.",
      },
      {
        q: "Can I check bmi on mobile?",
        a: "Yes. This bmi calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "loan-emi-calculator": {
    keyword: "emi calculator free",
    articleTitle: "How to calculate EMI free",
    paragraphs: [
      "Calculate Loan EMI free with this emi calculator. It matches the standard reducing-balance formula for home, car, or personal loans.",
      "How to calculate EMI: enter loan amount, annual interest, and tenure. Monthly EMI and total payable appear on the right.",
      "This emi calculator free page is built for desktop and mobile. Loan EMI Calculator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate loan EMI?",
        a: "Enter loan amount, annual interest, and tenure. Monthly EMI and total payable appear on the right.",
      },
      {
        q: "What formula does the EMI calculator use?",
        a: "Equated monthly installment uses EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r is the monthly rate and n is the number of months.",
      },
      {
        q: "Is the emi calculator free?",
        a: "Yes. You can calculate loan emi free with no signup and no software to install.",
      },
      {
        q: "Can I calculate loan emi on mobile?",
        a: "Yes. This loan emi calculator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "word-counter": {
    keyword: "word counter free",
    articleTitle: "How to count words free",
    paragraphs: [
      "Count Words free with this word counter. It counts words, characters, and reading time as you type.",
      "How to count words: paste or type your text above. Word count, characters, and reading time update as you type.",
      "This word counter free page is built for desktop and mobile. Word Counter Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I count words online?",
        a: "Paste or type your text above. Word count, characters, and reading time update as you type.",
      },
      {
        q: "How is reading time calculated?",
        a: "Reading time uses about 200 words per minute, which is a common estimate for essays, captions, and SEO briefs.",
      },
      {
        q: "Is the word counter free?",
        a: "Yes. You can count words free with no signup and no software to install.",
      },
      {
        q: "Can I count words on mobile?",
        a: "Yes. This word counter online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "currency-converter": {
    keyword: "currency converter free",
    articleTitle: "How to convert currency free",
    paragraphs: [
      "Convert Currency free with this currency converter. It converts USD, EUR, GBP, INR, and 150+ currencies.",
      "How to convert currency: enter an amount, pick the from and to currencies, and read the converted value.",
      "This currency converter free page is built for desktop and mobile. Live Currency Converter free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert currency online?",
        a: "Enter an amount, pick the from and to currencies, and read the converted value. USD, EUR, GBP, INR, and 150+ other codes are included.",
      },
      {
        q: "Are these live exchange rates?",
        a: "Rates refresh from a public FX feed about once a minute. Mid-market rates can differ from what a bank or card charges.",
      },
      {
        q: "Is the currency converter free?",
        a: "Yes. You can convert currency free with no signup and no software to install.",
      },
      {
        q: "Can I convert currency on mobile?",
        a: "Yes. This live currency converter free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "age-calculator": {
    keyword: "age calculator free",
    articleTitle: "How to calculate age free",
    paragraphs: [
      "Calculate Age free with this age calculator. It finds exact age in years, months, and days.",
      "How to calculate age: enter a date of birth above. Years, months, and days appear on the right.",
      "This age calculator free page is built for desktop and mobile. Age Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate age online?",
        a: "Enter a date of birth above. Years, months, and days appear on the right.",
      },
      {
        q: "Does it show age in years, months, and days?",
        a: "Yes. You get exact age in years, months, and days from the date of birth you enter.",
      },
      {
        q: "Is the age calculator free?",
        a: "Yes. You can calculate age free with no signup and no software to install.",
      },
      {
        q: "Can I calculate age on mobile?",
        a: "Yes. This age calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "qr-code-generator": {
    keyword: "qr code generator free",
    articleTitle: "How to create a QR code free",
    paragraphs: [
      "Create QR Code free with this qr code generator. It turns a link or text into a downloadable QR image.",
      "How to create a QR code: paste a link or text above. Download the QR image when it appears.",
      "This qr code generator free page is built for desktop and mobile. QR Code Generator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I create a QR code?",
        a: "Paste a link or text above. Download the QR image when it appears.",
      },
      {
        q: "Can I download the QR code?",
        a: "Yes. After the code is generated, download the image and use it on print or screens.",
      },
      {
        q: "Is the qr code generator free?",
        a: "Yes. You can create qr code free with no signup and no software to install.",
      },
      {
        q: "Can I create qr code on mobile?",
        a: "Yes. This qr code generator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "unit-converter": {
    keyword: "unit converter free",
    articleTitle: "How to convert units free",
    paragraphs: [
      "Convert Units free with this unit converter. It converts km to miles, kg to lbs, and more.",
      "How to convert units: pick a type, enter the amount, then choose from and to units.",
      "This unit converter free page is built for desktop and mobile. Unit Converter Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert units online?",
        a: "Pick a type, enter the amount, then choose from and to units. Conversion uses standard SI factors.",
      },
      {
        q: "Which units can I convert?",
        a: "Common searches include km to miles and kg to lbs. This converter also covers area, speed, time, data, pressure, energy, power, and angle.",
      },
      {
        q: "Is the unit converter free?",
        a: "Yes. You can convert units free with no signup and no software to install.",
      },
      {
        q: "Can I convert units on mobile?",
        a: "Yes. This unit converter online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "calorie-calculator": {
    keyword: "calorie calculator free",
    articleTitle: "How to calculate daily calories free",
    paragraphs: [
      "Calculate Calories free with this calorie calculator. We use Mifflin-St Jeor BMR times an activity factor.",
      "How to calculate daily calories: enter age, sex, height, weight, and activity, then read the estimate.",
      "This calorie calculator free page is built for desktop and mobile. Calorie Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate daily calories?",
        a: "Enter age, sex, height, weight, and activity, then read the estimate. Height and weight accept mixed units.",
      },
      {
        q: "Is this the same as BMR?",
        a: "BMR is calories at rest. This calorie calculator multiplies BMR by your activity level to estimate daily maintenance calories (TDEE) using Mifflin-St Jeor.",
      },
      {
        q: "Is the calorie calculator free?",
        a: "Yes. You can calculate calories free with no signup and no software to install.",
      },
      {
        q: "Can I calculate calories on mobile?",
        a: "Yes. This calorie calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "bmr-calculator": {
    keyword: "bmr calculator free",
    articleTitle: "How to calculate BMR free",
    paragraphs: [
      "Calculate BMR free with this bmr calculator. It finds basal metabolic rate from age, sex, height, and weight.",
      "How to calculate BMR: enter age, sex, height, and weight above. Resting calories appear on the right.",
      "This bmr calculator free page is built for desktop and mobile. BMR Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate BMR?",
        a: "Enter age, sex, height, and weight above. Resting calories appear on the right.",
      },
      {
        q: "What formula does the BMR calculator use?",
        a: "Basal metabolic rate uses the Mifflin-St Jeor equation from age, sex, height, and weight.",
      },
      {
        q: "Is the bmr calculator free?",
        a: "Yes. You can calculate bmr free with no signup and no software to install.",
      },
      {
        q: "Can I calculate bmr on mobile?",
        a: "Yes. This bmr calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "body-fat-calculator": {
    keyword: "body fat calculator free",
    articleTitle: "How to estimate body fat free",
    paragraphs: [
      "Calculate Body Fat free with this body fat calculator. It estimates body fat percentage from BMI, age, and sex.",
      "How to estimate body fat: enter BMI or the fields above, plus age and sex, then read the percentage.",
      "This body fat calculator free page is built for desktop and mobile. Body Fat Percentage Calculator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I estimate body fat percentage?",
        a: "Enter BMI or the fields above, plus age and sex, then read the percentage.",
      },
      {
        q: "Is this a medical body fat test?",
        a: "No. It is an estimate from BMI, age, and sex, not a DEXA or caliper measurement.",
      },
      {
        q: "Is the body fat calculator free?",
        a: "Yes. You can calculate body fat free with no signup and no software to install.",
      },
      {
        q: "Can I calculate body fat on mobile?",
        a: "Yes. This body fat percentage calculator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "pregnancy-due-date-calculator": {
    keyword: "due date calculator free",
    articleTitle: "How to estimate due date free",
    paragraphs: [
      "Calculate Due Date free with this due date calculator. It estimates due date from the first day of your last period.",
      "How to estimate due date: enter the first day of your last period. The estimated due date appears on the right.",
      "This due date calculator free page is built for desktop and mobile. Pregnancy Due Date Calculator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I estimate my due date?",
        a: "Enter the first day of your last period. The estimated due date appears on the right.",
      },
      {
        q: "Is this due date medical advice?",
        a: "No. It is informational only. Confirm dates with your clinician.",
      },
      {
        q: "Is the due date calculator free?",
        a: "Yes. You can calculate due date free with no signup and no software to install.",
      },
      {
        q: "Can I calculate due date on mobile?",
        a: "Yes. This pregnancy due date calculator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "ovulation-calculator": {
    keyword: "ovulation calculator free",
    articleTitle: "How to estimate ovulation free",
    paragraphs: [
      "Calculate Ovulation free with this ovulation calculator. It estimates ovulation day and the fertile window.",
      "How to estimate ovulation: enter cycle length and the first day of your last period.",
      "This ovulation calculator free page is built for desktop and mobile. Ovulation Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I estimate ovulation?",
        a: "Enter cycle length and the first day of your last period. Ovulation day and the fertile window appear on the right.",
      },
      {
        q: "What is the fertile window?",
        a: "The fertile window is the days around estimated ovulation when conception is more likely. This is a planning aid, not a fertility diagnosis.",
      },
      {
        q: "Is the ovulation calculator free?",
        a: "Yes. You can calculate ovulation free with no signup and no software to install.",
      },
      {
        q: "Can I calculate ovulation on mobile?",
        a: "Yes. This ovulation calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "water-intake-calculator": {
    keyword: "water intake calculator free",
    articleTitle: "How to get a water goal free",
    paragraphs: [
      "Calculate Water Intake free with this water intake calculator. It gives a daily water goal from body weight.",
      "How to get a water goal: enter body weight above. The daily litre target appears on the right.",
      "This water intake calculator free page is built for desktop and mobile. Water Intake Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate daily water intake?",
        a: "Enter body weight above. The daily litre target appears on the right.",
      },
      {
        q: "How is the water goal calculated?",
        a: "The page estimates a daily water goal from body weight. Climate, exercise, and health needs can change how much you should drink.",
      },
      {
        q: "Is the water intake calculator free?",
        a: "Yes. You can calculate water intake free with no signup and no software to install.",
      },
      {
        q: "Can I calculate water intake on mobile?",
        a: "Yes. This water intake calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "period-calculator": {
    keyword: "period calculator free",
    articleTitle: "How to estimate your next period free",
    paragraphs: [
      "Calculate Next Period free with this period calculator. It estimates next period dates from last period and cycle length.",
      "How to estimate your next period: enter the first day of your last period and cycle length.",
      "This period calculator free page is built for desktop and mobile. Period Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I estimate my next period?",
        a: "Enter the first day of your last period and cycle length. Estimated next period dates appear on the right.",
      },
      {
        q: "Does irregular cycling change the result?",
        a: "Yes. The estimate assumes a regular cycle length. Irregular cycles need a clinician for tracking, not this planning aid alone.",
      },
      {
        q: "Is the period calculator free?",
        a: "Yes. You can calculate next period free with no signup and no software to install.",
      },
      {
        q: "Can I calculate next period on mobile?",
        a: "Yes. This period calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "compound-interest-calculator": {
    keyword: "compound interest calculator free",
    articleTitle: "How to calculate compound interest free",
    paragraphs: [
      "Calculate Compound Interest free with this compound interest calculator. It shows future value from principal, rate, time, and compounding.",
      "How to calculate compound interest: enter principal, rate, years, and compounding, then read the future value.",
      "This compound interest calculator free page is built for desktop and mobile. Compound Interest Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate compound interest?",
        a: "Enter principal, rate, years, and compounding, then read the future value.",
      },
      {
        q: "What is compounding?",
        a: "Compounding adds interest to the balance so later interest is earned on a larger amount. More frequent compounding grows the total faster.",
      },
      {
        q: "Is the compound interest calculator free?",
        a: "Yes. You can calculate compound interest free with no signup and no software to install.",
      },
      {
        q: "Can I calculate compound interest on mobile?",
        a: "Yes. This compound interest calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "gst-calculator": {
    keyword: "gst calculator free",
    articleTitle: "How to calculate GST free",
    paragraphs: [
      "Calculate GST free with this gst calculator. It adds or removes GST or VAT from any amount.",
      "How to calculate GST: enter the amount and tax percent, then choose add or remove GST.",
      "This gst calculator free page is built for desktop and mobile. GST Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate GST?",
        a: "Enter the amount and tax percent, then choose add or remove GST.",
      },
      {
        q: "Can I add or remove GST?",
        a: "Yes. Add GST to a base amount or remove GST from an inclusive total. The same page also works as a VAT calculator.",
      },
      {
        q: "Is the gst calculator free?",
        a: "Yes. You can calculate gst free with no signup and no software to install.",
      },
      {
        q: "Can I calculate gst on mobile?",
        a: "Yes. This gst calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "tip-calculator": {
    keyword: "tip calculator free",
    articleTitle: "How to calculate a tip free",
    paragraphs: [
      "Calculate Tip free with this tip calculator. It splits a bill with tip percent and number of people.",
      "How to calculate a tip: enter the bill, tip percent, and number of people. The split appears on the right.",
      "This tip calculator free page is built for desktop and mobile. Tip Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate a tip?",
        a: "Enter the bill, tip percent, and number of people. The split appears on the right.",
      },
      {
        q: "Can I split a bill with this tip calculator?",
        a: "Yes. Enter how many people are paying. You get the tip, the total, and the per-person split.",
      },
      {
        q: "Is the tip calculator free?",
        a: "Yes. You can calculate tip free with no signup and no software to install.",
      },
      {
        q: "Can I calculate tip on mobile?",
        a: "Yes. This tip calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "discount-calculator": {
    keyword: "discount calculator free",
    articleTitle: "How to calculate a discount free",
    paragraphs: [
      "Calculate Discount free with this discount calculator. It finds the sale price and amount saved.",
      "How to calculate a discount: enter the original price and percent off. Sale price and savings appear on the right.",
      "This discount calculator free page is built for desktop and mobile. Discount Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate a discount?",
        a: "Enter the original price and percent off. Sale price and savings appear on the right.",
      },
      {
        q: "Does it show amount saved?",
        a: "Yes. You see the sale price and how much you save from the original price.",
      },
      {
        q: "Is the discount calculator free?",
        a: "Yes. You can calculate discount free with no signup and no software to install.",
      },
      {
        q: "Can I calculate discount on mobile?",
        a: "Yes. This discount calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "sip-calculator": {
    keyword: "sip calculator free",
    articleTitle: "How to calculate SIP returns free",
    paragraphs: [
      "Calculate SIP free with this sip calculator. It estimates SIP maturity from monthly amount, return, and years.",
      "How to calculate SIP returns: enter monthly amount, expected return, and years.",
      "This sip calculator free page is built for desktop and mobile. SIP Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate SIP returns?",
        a: "Enter monthly amount, expected return, and years. Estimated maturity appears on the right.",
      },
      {
        q: "Is SIP return guaranteed?",
        a: "No. This is an estimate from the rate you enter. Mutual fund returns vary.",
      },
      {
        q: "Is the sip calculator free?",
        a: "Yes. You can calculate sip free with no signup and no software to install.",
      },
      {
        q: "Can I calculate sip on mobile?",
        a: "Yes. This sip calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "simple-interest-calculator": {
    keyword: "simple interest calculator free",
    articleTitle: "How to calculate simple interest free",
    paragraphs: [
      "Calculate Simple Interest free with this simple interest calculator. It shows interest and total payable from principal, rate, and time.",
      "How to calculate simple interest: enter principal, annual rate, and time.",
      "This simple interest calculator free page is built for desktop and mobile. Simple Interest Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate simple interest?",
        a: "Enter principal, annual rate, and time. Interest and total payable appear on the right.",
      },
      {
        q: "What is the simple interest formula?",
        a: "Simple interest is principal × rate × time. It does not compound.",
      },
      {
        q: "Is the simple interest calculator free?",
        a: "Yes. You can calculate simple interest free with no signup and no software to install.",
      },
      {
        q: "Can I calculate simple interest on mobile?",
        a: "Yes. This simple interest calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "fd-calculator": {
    keyword: "fd calculator free",
    articleTitle: "How to calculate FD maturity free",
    paragraphs: [
      "Calculate FD free with this fd calculator. It estimates fixed deposit maturity from amount, rate, and years.",
      "How to calculate FD maturity: enter deposit amount, annual rate, and years.",
      "This fd calculator free page is built for desktop and mobile. FD Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate FD maturity?",
        a: "Enter deposit amount, annual rate, and years. Estimated maturity appears on the right.",
      },
      {
        q: "Is this the same as my bank FD quote?",
        a: "It is an estimate from the rate and term you enter. Confirm compounding and payout with your bank.",
      },
      {
        q: "Is the fd calculator free?",
        a: "Yes. You can calculate fd free with no signup and no software to install.",
      },
      {
        q: "Can I calculate fd on mobile?",
        a: "Yes. This fd calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "case-converter": {
    keyword: "case converter free",
    articleTitle: "How to convert case free",
    paragraphs: [
      "Convert Case free with this case converter. It switches text to upper, lower, title, or sentence case.",
      "How to convert case: paste text above and pick upper, lower, title, or sentence case, then copy the result.",
      "This case converter free page is built for desktop and mobile. Uppercase Converter free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert uppercase and lowercase?",
        a: "Paste text above and pick upper, lower, title, or sentence case, then copy the result.",
      },
      {
        q: "Which cases can I convert?",
        a: "Uppercase, lowercase, title case, and sentence case. Copy the converted text when you are done.",
      },
      {
        q: "Is the case converter free?",
        a: "Yes. You can convert case free with no signup and no software to install.",
      },
      {
        q: "Can I convert case on mobile?",
        a: "Yes. This uppercase converter free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "password-generator": {
    keyword: "password generator free",
    articleTitle: "How to generate a password free",
    paragraphs: [
      "Generate Password free with this password generator. It creates a strong random password in your browser.",
      "How to generate a password: pick length and character options, then click generate and copy the password.",
      "This password generator free page is built for desktop and mobile. Strong Password Generator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate a strong password?",
        a: "Pick length and character options, then click generate and copy the password.",
      },
      {
        q: "Are passwords stored?",
        a: "No. Generation runs in your browser. Nothing is stored on a server.",
      },
      {
        q: "Is the password generator free?",
        a: "Yes. You can generate password free with no signup and no software to install.",
      },
      {
        q: "Can I generate password on mobile?",
        a: "Yes. This strong password generator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "lorem-ipsum-generator": {
    keyword: "lorem ipsum generator free",
    articleTitle: "How to generate lorem ipsum free",
    paragraphs: [
      "Generate Lorem Ipsum free with this lorem ipsum generator. It generates placeholder paragraphs for layouts and drafts.",
      "How to generate lorem ipsum: choose how many paragraphs you need, then copy the dummy text.",
      "This lorem ipsum generator free page is built for desktop and mobile. Dummy Text Generator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate lorem ipsum?",
        a: "Choose how many paragraphs you need, then copy the dummy text.",
      },
      {
        q: "Is this dummy text copyrighted?",
        a: "Lorem ipsum is classic placeholder copy for layouts and drafts. Copy as many paragraphs as you need.",
      },
      {
        q: "Is the lorem ipsum generator free?",
        a: "Yes. You can generate lorem ipsum free with no signup and no software to install.",
      },
      {
        q: "Can I generate lorem ipsum on mobile?",
        a: "Yes. This dummy text generator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "text-reverser": {
    keyword: "reverse text free",
    articleTitle: "How to reverse text free",
    paragraphs: [
      "Reverse Letters free with this reverse text. It reverses characters or words in any block of text.",
      "How to reverse text: paste text above and choose reverse letters or reverse words, then copy the result.",
      "This reverse text free page is built for desktop and mobile. Backwards Text free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I reverse text?",
        a: "Paste text above and choose reverse letters or reverse words, then copy the result.",
      },
      {
        q: "Can I reverse words instead of letters?",
        a: "Yes. Reverse characters in the whole string, or reverse the order of words.",
      },
      {
        q: "Is the reverse text free?",
        a: "Yes. You can reverse letters free with no signup and no software to install.",
      },
      {
        q: "Can I reverse letters on mobile?",
        a: "Yes. This backwards text free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "base64-encoder": {
    keyword: "base64 encoder free",
    articleTitle: "How to encode or decode Base64 free",
    paragraphs: [
      "Encode Base64 free with this base64 encoder. It encodes or decodes text in your browser.",
      "How to encode or decode Base64: paste text, pick encode or decode, then copy the result.",
      "This base64 encoder free page is built for desktop and mobile. Base64 Decoder free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I encode or decode Base64?",
        a: "Paste text, pick encode or decode, then copy the result.",
      },
      {
        q: "Can I decode Base64 as well as encode?",
        a: "Yes. This page encodes text to Base64 and decodes Base64 back to text.",
      },
      {
        q: "Is the base64 encoder free?",
        a: "Yes. You can encode base64 free with no signup and no software to install.",
      },
      {
        q: "Can I encode base64 on mobile?",
        a: "Yes. This base64 decoder free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "slug-generator": {
    keyword: "slug generator free",
    articleTitle: "How to make a URL slug free",
    paragraphs: [
      "Generate Slug free with this slug generator. It turns a title into a hyphenated slug for blogs and pages.",
      "How to make a URL slug: paste a title above. Copy the lowercase hyphenated slug.",
      "This slug generator free page is built for desktop and mobile. URL Slug Generator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I make a URL slug?",
        a: "Paste a title above. Copy the lowercase hyphenated slug.",
      },
      {
        q: "What does a URL slug look like?",
        a: "A slug is a lowercase, hyphenated permalink such as my-blog-post-title.",
      },
      {
        q: "Is the slug generator free?",
        a: "Yes. You can generate slug free with no signup and no software to install.",
      },
      {
        q: "Can I generate slug on mobile?",
        a: "Yes. This url slug generator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "json-formatter": {
    keyword: "json formatter free",
    articleTitle: "How to format JSON free",
    paragraphs: [
      "Format JSON free with this json formatter. It beautifies or minifies JSON in your browser.",
      "How to format JSON: paste JSON above and choose beautify or minify. Copy the result when it is valid.",
      "This json formatter free page is built for desktop and mobile. JSON Beautifier free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I format JSON?",
        a: "Paste JSON above and choose beautify or minify. Copy the result when it is valid.",
      },
      {
        q: "Can I minify JSON as well as beautify it?",
        a: "Yes. Beautify adds readable indenting. Minify removes extra whitespace.",
      },
      {
        q: "Is the json formatter free?",
        a: "Yes. You can format json free with no signup and no software to install.",
      },
      {
        q: "Can I format json on mobile?",
        a: "Yes. This json beautifier free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "temperature-converter": {
    keyword: "temperature converter free",
    articleTitle: "How to convert temperature free",
    paragraphs: [
      "Convert Celsius to Fahrenheit free with this temperature converter. It converts Celsius, Fahrenheit, and Kelvin instantly.",
      "How to convert temperature: enter a value and pick from and to units (Celsius, Fahrenheit, or Kelvin).",
      "This temperature converter free page is built for desktop and mobile. Celsius to Fahrenheit free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert Celsius to Fahrenheit?",
        a: "Enter a value and pick from and to units (Celsius, Fahrenheit, or Kelvin).",
      },
      {
        q: "Can I convert Kelvin as well?",
        a: "Yes. Convert between Celsius, Fahrenheit, and Kelvin on the same page.",
      },
      {
        q: "Is the temperature converter free?",
        a: "Yes. You can convert celsius to fahrenheit free with no signup and no software to install.",
      },
      {
        q: "Can I convert celsius to fahrenheit on mobile?",
        a: "Yes. This celsius to fahrenheit free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "number-to-words": {
    keyword: "number to words converter free",
    articleTitle: "How to convert a number to words free",
    paragraphs: [
      "Convert Number to Words free with this number to words converter. Type the digits and copy the words for cheques, invoices, contracts, and forms.",
      "How to convert a number to words: type the number above. English words appear as you type.",
      "This number to words converter free page is built for desktop and mobile. Number to Words free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert a number to words?",
        a: "Type the number in the field above. The English wording appears as you type so you can copy it.",
      },
      {
        q: "Can I use number to words for cheque amounts?",
        a: "Yes. Convert the amount to words, then add the currency and “only” if your bank requires that format.",
      },
      {
        q: "Is the number to words converter free?",
        a: "Yes. You can convert number to words free with no signup and no software to install.",
      },
      {
        q: "Can I convert number to words on mobile?",
        a: "Yes. This number to words free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "binary-converter": {
    keyword: "binary converter free",
    articleTitle: "How to convert binary free",
    paragraphs: [
      "Convert Decimal to Binary free with this binary converter. It converts between decimal, binary, and hexadecimal.",
      "How to convert binary: enter a decimal, binary, or hex value. The other bases appear together.",
      "This binary converter free page is built for desktop and mobile. Decimal to Binary free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert decimal to binary?",
        a: "Enter a decimal, binary, or hex value. The other bases appear together.",
      },
      {
        q: "Can I convert hexadecimal as well?",
        a: "Yes. Convert between decimal, binary, and hexadecimal. This is integer conversion, not floating-point.",
      },
      {
        q: "Is the binary converter free?",
        a: "Yes. You can convert decimal to binary free with no signup and no software to install.",
      },
      {
        q: "Can I convert decimal to binary on mobile?",
        a: "Yes. This decimal to binary free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-converter": {
    keyword: "color converter free",
    articleTitle: "How to convert a color free",
    paragraphs: [
      "Convert HEX RGB HSL free with this color converter. It converts HEX, RGB, HSL, HSV, and CMYK on one page.",
      "How to convert a color: pick a from-format, paste the value, then copy HEX, RGB, HSL, HSV, or CMYK.",
      "This color converter free page is built for desktop and mobile. HEX RGB HSL Converter free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert HEX, RGB, and HSL?",
        a: "Pick a from-format, paste the value, then copy HEX, RGB, HSL, HSV, or CMYK.",
      },
      {
        q: "Which color formats can I convert?",
        a: "HEX, RGB, HSL, HSV, and CMYK. One-way converters such as HEX to RGB are separate pages if you only need that pair.",
      },
      {
        q: "Is the color converter free?",
        a: "Yes. You can convert hex rgb hsl free with no signup and no software to install.",
      },
      {
        q: "Can I convert hex rgb hsl on mobile?",
        a: "Yes. This hex rgb hsl converter free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "roman-numeral-converter": {
    keyword: "roman numeral converter free",
    articleTitle: "How to convert Roman numerals free",
    paragraphs: [
      "Convert Numbers to Roman Numerals free with this roman numeral converter. It converts numbers from 1 to 3999 into Roman numerals and back.",
      "How to convert Roman numerals: enter a number or a Roman numeral above. The other form appears on the right.",
      "This roman numeral converter free page is built for desktop and mobile. Numbers to Roman Numerals free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert numbers to Roman numerals?",
        a: "Enter a number or a Roman numeral above. The other form appears on the right.",
      },
      {
        q: "What number range is supported?",
        a: "Convert numbers from 1 to 3999 into Roman numerals and back.",
      },
      {
        q: "Is the roman numeral converter free?",
        a: "Yes. You can convert numbers to roman numerals free with no signup and no software to install.",
      },
      {
        q: "Can I convert numbers to roman numerals on mobile?",
        a: "Yes. This numbers to roman numerals free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "time-calculator": {
    keyword: "time calculator free",
    articleTitle: "How to add time free",
    paragraphs: [
      "Add Hours Minutes free with this time calculator. It adds hours, minutes, and seconds into a total time.",
      "How to add time: enter hours, minutes, and seconds. The total duration appears on the right.",
      "This time calculator free page is built for desktop and mobile. Time Calculator Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I add hours and minutes?",
        a: "Enter hours, minutes, and seconds. The total duration appears on the right.",
      },
      {
        q: "Can I add seconds as well?",
        a: "Yes. Add hours, minutes, and seconds into a total time.",
      },
      {
        q: "Is the time calculator free?",
        a: "Yes. You can add hours minutes free with no signup and no software to install.",
      },
      {
        q: "Can I add hours minutes on mobile?",
        a: "Yes. This time calculator online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "date-difference-calculator": {
    keyword: "date difference calculator free",
    articleTitle: "How to find days between dates free",
    paragraphs: [
      "Calculate Days Between Dates free with this date difference calculator. It finds years, months, weeks, and days between two dates.",
      "How to find days between dates: pick a start date and an end date. Years, months, and total days appear on the right.",
      "This date difference calculator free page is built for desktop and mobile. Days Between Two Dates free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I find days between two dates?",
        a: "Pick a start date and an end date. Years, months, and total days appear on the right.",
      },
      {
        q: "Does it show years and months as well as days?",
        a: "Yes. You get years, months, weeks, and days between the two dates.",
      },
      {
        q: "Is the date difference calculator free?",
        a: "Yes. You can calculate days between dates free with no signup and no software to install.",
      },
      {
        q: "Can I calculate days between dates on mobile?",
        a: "Yes. This days between two dates free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "time-zone-converter": {
    keyword: "time zone converter free",
    articleTitle: "How to convert time zones free",
    paragraphs: [
      "Convert Time Zones free with this time zone converter. It converts a date and time between world time zones.",
      "How to convert time zones: pick a date, time, from zone, and to zone. The converted time appears on the right.",
      "This time zone converter free page is built for desktop and mobile. Timezone Converter free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert time zones?",
        a: "Pick a date, time, from zone, and to zone. The converted time appears on the right.",
      },
      {
        q: "Does it use daylight saving time?",
        a: "The conversion uses the selected time zones for the date you enter, including standard DST rules in the browser.",
      },
      {
        q: "Is the time zone converter free?",
        a: "Yes. You can convert time zones free with no signup and no software to install.",
      },
      {
        q: "Can I convert time zones on mobile?",
        a: "Yes. This timezone converter free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "pdf-to-word": {
    keyword: "pdf to word converter free",
    articleTitle: "How to convert PDF to Word free",
    paragraphs: [
      "Convert PDF to Word free with this pdf to word converter. It turns a PDF into a DOCX you can download instantly.",
      "How to convert PDF to Word: add your PDF above, click Convert to Word, then download the DOCX.",
      "This pdf to word converter free page is built for desktop and mobile. PDF to Word free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert PDF to Word?",
        a: "Open this page, add your PDF, click Convert to Word, and download the DOCX. The PDF to Word converter runs in your browser.",
      },
      {
        q: "Will my formatting stay the same?",
        a: "Text is preserved. Complex layouts, tables, and images are simplified in the Word file. Scanned image-only PDFs may return little text.",
      },
      {
        q: "Is the pdf to word converter free?",
        a: "Yes. You can convert pdf to word free with no signup and no software to install.",
      },
      {
        q: "Can I convert pdf to word on mobile?",
        a: "Yes. This pdf to word free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "word-to-pdf": {
    keyword: "word to pdf converter free",
    articleTitle: "How to convert Word to PDF free",
    paragraphs: [
      "Convert Word to PDF free with this word to pdf converter. It turns a DOCX into a PDF you can download instantly.",
      "How to convert Word to PDF: add a DOCX file above, click Convert to PDF, then download the PDF.",
      "This word to pdf converter free page is built for desktop and mobile. Word to PDF free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert Word to PDF?",
        a: "Add a DOCX file above, click Convert to PDF, and download the PDF. The Word to PDF converter runs in your browser.",
      },
      {
        q: "Does it support older .doc files?",
        a: "Older .doc files are not supported. Save as .docx in Word first, then convert.",
      },
      {
        q: "Is the word to pdf converter free?",
        a: "Yes. You can convert word to pdf free with no signup and no software to install.",
      },
      {
        q: "Can I convert word to pdf on mobile?",
        a: "Yes. This word to pdf free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "pdf-to-jpg": {
    keyword: "pdf to jpg converter free",
    articleTitle: "How to convert PDF to JPG free",
    paragraphs: [
      "Convert PDF to JPG free with this pdf to jpg converter. It exports every PDF page as a JPEG you can download instantly.",
      "How to convert PDF to JPG: add your PDF above, click Convert to JPG, then download the JPEG pages.",
      "This pdf to jpg converter free page is built for desktop and mobile. PDF to JPG free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert PDF to JPG?",
        a: "Add your PDF above, click Convert to JPG, and download the JPEG pages. The PDF to JPG converter runs in your browser.",
      },
      {
        q: "Can I convert a multi-page PDF to JPG?",
        a: "Yes. Every page is exported as a JPEG. Multi-page files download as a zip.",
      },
      {
        q: "Is the pdf to jpg converter free?",
        a: "Yes. You can convert pdf to jpg free with no signup and no software to install.",
      },
      {
        q: "Can I convert pdf to jpg on mobile?",
        a: "Yes. This pdf to jpg free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "jpg-to-pdf": {
    keyword: "jpg to pdf converter free",
    articleTitle: "How to convert JPG to PDF free",
    paragraphs: [
      "Convert JPG to PDF free with this jpg to pdf converter. Upload one or more JPG images, convert them to PDF, and download instantly. No software installation is required, and the files stay in your browser.",
      "How to convert JPG to PDF: add your JPG or JPEG files above, click Convert to PDF, then download the PDF. You can also include PNG images if you need mixed photos in one file. Each image becomes its own page.",
      "This jpg to pdf converter free page is built for desktop and mobile. JPG to PDF free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert JPG to PDF?",
        a: "Open this page, add your JPG images, click Convert to PDF, and download the file. This JPG to PDF converter runs in your browser.",
      },
      {
        q: "Can I convert multiple JPG images to one PDF?",
        a: "Yes. Add more than one JPG and they are combined into a single PDF, with each image on its own page.",
      },
      {
        q: "Is the jpg to pdf converter free?",
        a: "Yes. You can convert jpg to pdf free with no signup and no software to install.",
      },
      {
        q: "Can I convert jpg to pdf on mobile?",
        a: "Yes. This jpg to pdf free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "excel-to-pdf": {
    keyword: "excel to pdf converter free",
    articleTitle: "How to convert Excel to PDF free",
    paragraphs: [
      "Convert Excel to PDF free with this excel to pdf converter. It turns XLSX or CSV into a PDF you can download instantly.",
      "How to convert Excel to PDF: add an XLSX or CSV file above, click Convert to PDF, then download the PDF.",
      "This excel to pdf converter free page is built for desktop and mobile. Excel to PDF free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert Excel to PDF?",
        a: "Add an XLSX or CSV file above, click Convert to PDF, and download the PDF. The Excel to PDF converter runs in your browser.",
      },
      {
        q: "Does it support CSV as well as XLSX?",
        a: "Yes. Upload XLSX or CSV, convert to PDF, and download instantly.",
      },
      {
        q: "Is the excel to pdf converter free?",
        a: "Yes. You can convert excel to pdf free with no signup and no software to install.",
      },
      {
        q: "Can I convert excel to pdf on mobile?",
        a: "Yes. This excel to pdf free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "ppt-to-pdf": {
    keyword: "ppt to pdf converter free",
    articleTitle: "How to convert PPT to PDF free",
    paragraphs: [
      "Convert PPT to PDF free with this ppt to pdf converter. Upload a PowerPoint .ppt or .pptx file and download a PDF instantly. Slide layouts are processed in your browser.",
      "How to convert PPT to PDF: drop your presentation above, click Convert to PDF, then download the file.",
      "This ppt to pdf converter free page is built for desktop and mobile. PPT to PDF free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert PPT to PDF free?",
        a: "Add a .ppt or .pptx file above, click Convert to PDF, and download the result. No account is required.",
      },
      {
        q: "Does it work with PPTX files?",
        a: "Yes. Both older .ppt files and .pptx files are supported.",
      },
      {
        q: "Is the ppt to pdf converter free?",
        a: "Yes. You can convert ppt to pdf free with no signup and no software to install.",
      },
      {
        q: "Can I convert ppt to pdf on mobile?",
        a: "Yes. This ppt to pdf free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "compress-pdf": {
    keyword: "compress pdf free",
    articleTitle: "How to compress a PDF free",
    paragraphs: [
      "Compress PDF Online free with this compress pdf. It reduces PDF file size for email and uploads.",
      "How to compress a PDF: add a PDF above, click Compress File, then download the smaller PDF.",
      "This compress pdf free page is built for desktop and mobile. PDF Compressor free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I compress a PDF?",
        a: "Add a PDF above, click Compress File, and download the smaller PDF. Compression runs in your browser.",
      },
      {
        q: "Will the quality be affected?",
        a: "Text stays fully sharp. The file is rewritten. Image-heavy PDFs may shrink more than text-only files.",
      },
      {
        q: "Is the compress pdf free?",
        a: "Yes. You can compress pdf online free with no signup and no software to install.",
      },
      {
        q: "Can I compress pdf online on mobile?",
        a: "Yes. This pdf compressor free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "merge-pdf": {
    keyword: "merge pdf free",
    articleTitle: "How to merge PDFs free",
    paragraphs: [
      "Merge PDF Online free with this merge pdf. It combines multiple PDFs into one document you can download instantly.",
      "How to merge PDFs: add two or more PDFs above, click Merge Files, then download the combined PDF.",
      "This merge pdf free page is built for desktop and mobile. Combine PDF free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I merge PDF files?",
        a: "Add two or more PDFs above, click Merge Files, and download the combined PDF.",
      },
      {
        q: "In what order are PDFs merged?",
        a: "Files are combined in the order you add them. Remove any you do not need before you merge.",
      },
      {
        q: "Is the merge pdf free?",
        a: "Yes. You can merge pdf online free with no signup and no software to install.",
      },
      {
        q: "Can I merge pdf online on mobile?",
        a: "Yes. This combine pdf free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "pdf-to-png": {
    keyword: "pdf to png converter free",
    articleTitle: "How to convert PDF to PNG free",
    paragraphs: [
      "Convert PDF to PNG free with this pdf to png converter. It exports each PDF page as a PNG you can download instantly.",
      "How to convert PDF to PNG: add your PDF above, click Convert to PNG, then download the PNG pages.",
      "This pdf to png converter free page is built for desktop and mobile. PDF to PNG free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert PDF to PNG?",
        a: "Add your PDF above, click Convert to PNG, and download the PNG pages.",
      },
      {
        q: "Can I convert every page to PNG?",
        a: "Yes. Each page is exported as a PNG so you keep a lossless page image.",
      },
      {
        q: "Is the pdf to png converter free?",
        a: "Yes. You can convert pdf to png free with no signup and no software to install.",
      },
      {
        q: "Can I convert pdf to png on mobile?",
        a: "Yes. This pdf to png free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "png-to-pdf": {
    keyword: "png to pdf converter free",
    articleTitle: "How to convert PNG to PDF free",
    paragraphs: [
      "Convert PNG to PDF free with this png to pdf converter. It turns PNG images into a PDF you can download instantly.",
      "How to convert PNG to PDF: add one or more PNG files above, click Convert to PDF, then download the PDF.",
      "This png to pdf converter free page is built for desktop and mobile. PNG to PDF free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert PNG to PDF?",
        a: "Add one or more PNG files above, click Convert to PDF, and download the PDF.",
      },
      {
        q: "Can I convert multiple PNG images to one PDF?",
        a: "Yes. Add more than one PNG and they are combined into a single PDF, with each image on its own page.",
      },
      {
        q: "Is the png to pdf converter free?",
        a: "Yes. You can convert png to pdf free with no signup and no software to install.",
      },
      {
        q: "Can I convert png to pdf on mobile?",
        a: "Yes. This png to pdf free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "split-pdf": {
    keyword: "split pdf free",
    articleTitle: "How to split a PDF free",
    paragraphs: [
      "Split PDF Online free with this split pdf. It saves each page as its own PDF you can download instantly.",
      "How to split a PDF: add a PDF above, click Split File, then download one PDF per page.",
      "This split pdf free page is built for desktop and mobile. Split PDF Pages free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I split a PDF?",
        a: "Add a PDF above, click Split File, and download one PDF per page.",
      },
      {
        q: "Does split PDF create one file per page?",
        a: "Yes. Each page is saved as its own PDF so you can extract or share a single page.",
      },
      {
        q: "Is the split pdf free?",
        a: "Yes. You can split pdf online free with no signup and no software to install.",
      },
      {
        q: "Can I split pdf online on mobile?",
        a: "Yes. This split pdf pages free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "sleep-calculator": {
    keyword: "sleep calculator free",
    articleTitle: "How to use the sleep calculator free",
    paragraphs: [
      "Calculate Bedtime free with this sleep calculator. It adds about 15 minutes to fall asleep, then counts 90-minute cycles.",
      "How to use the sleep calculator: pick bedtime or wake time, enter the clock time, then read the cycle options.",
      "This sleep calculator free page is built for desktop and mobile. Sleep Cycle Calculator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I use the sleep calculator?",
        a: "Pick bedtime or wake time, enter the clock time, then read the cycle options. It adds 15 minutes to fall asleep, then counts 90-minute sleep cycles.",
      },
      {
        q: "How many hours of sleep should I get?",
        a: "Many adults feel better with 7 to 9 hours. That is usually 5 or 6 complete 90-minute cycles plus time to fall asleep.",
      },
      {
        q: "Is the sleep calculator free?",
        a: "Yes. You can calculate bedtime free with no signup and no software to install.",
      },
      {
        q: "Can I calculate bedtime on mobile?",
        a: "Yes. This sleep cycle calculator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "mortgage-calculator": {
    keyword: "mortgage calculator free",
    articleTitle: "How to calculate a mortgage payment free",
    paragraphs: [
      "Calculate Mortgage free with this mortgage calculator. The payment uses the standard amortizing formula for principal and interest.",
      "How to calculate a mortgage payment: enter home price, down payment, rate, and term. Monthly payment appears on the right.",
      "This mortgage calculator free page is built for desktop and mobile. Mortgage Payment Calculator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate a mortgage payment?",
        a: "Enter home price, down payment, annual interest percent, and loan term in years. Monthly payment, total payable, and total interest update on the right.",
      },
      {
        q: "Does it include taxes and insurance?",
        a: "No. This page estimates principal and interest only. Add tax, insurance, and PMI from your lender quote.",
      },
      {
        q: "Is the mortgage calculator free?",
        a: "Yes. You can calculate mortgage free with no signup and no software to install.",
      },
      {
        q: "Can I calculate mortgage on mobile?",
        a: "Yes. This mortgage payment calculator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "random-number-generator": {
    keyword: "random number generator free",
    articleTitle: "How to generate a random number free",
    paragraphs: [
      "Generate Random Number free with this random number generator. It picks random numbers between any min and max, including 1 to 100.",
      "How to generate a random number: set minimum, maximum, and how many, then click Generate.",
      "This random number generator free page is built for desktop and mobile. Random Number Generator 1-100 free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate a random number from 1 to 100?",
        a: "Set minimum to 1, maximum to 100, how many to 1, then click Generate. This random number generator 1-100 run stays in your browser.",
      },
      {
        q: "Can I generate more than one number?",
        a: "Yes. Set How many to any value from 1 to 100. Results appear as a comma-separated list.",
      },
      {
        q: "Is the random number generator free?",
        a: "Yes. You can generate random number free with no signup and no software to install.",
      },
      {
        q: "Can I generate random number on mobile?",
        a: "Yes. This random number generator 1-100 free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "gpa-calculator": {
    keyword: "gpa calculator free",
    articleTitle: "How to calculate GPA free",
    paragraphs: [
      "Calculate GPA free with this gpa calculator. On a 10-point scale, CGPA to percentage uses CGPA × 9.5.",
      "How to calculate GPA: enter credits and grade points, or use CGPA to percentage mode, then read the result.",
      "This gpa calculator free page is built for desktop and mobile. CGPA to Percentage free means no account, no install, and no signup.",
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
        q: "Is the gpa calculator free?",
        a: "Yes. You can calculate gpa free with no signup and no software to install.",
      },
      {
        q: "Can I calculate gpa on mobile?",
        a: "Yes. This cgpa to percentage free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "png-to-jpg": {
    keyword: "png to jpg converter free",
    articleTitle: "How to convert PNG to JPG free",
    paragraphs: [
      "Convert PNG to JPG free with this png to jpg converter. It turns a PNG into a JPEG you can download instantly.",
      "How to convert PNG to JPG: add a PNG above, click Convert to JPG, then download the JPEG.",
      "This png to jpg converter free page is built for desktop and mobile. PNG to JPG free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert PNG to JPG?",
        a: "Add a PNG above, click Convert to JPG, and download the JPEG. The PNG to JPG converter runs in your browser.",
      },
      {
        q: "Will transparent PNG stay transparent?",
        a: "No. JPEG does not support transparency. Transparent pixels are filled with white.",
      },
      {
        q: "Is the png to jpg converter free?",
        a: "Yes. You can convert png to jpg free with no signup and no software to install.",
      },
      {
        q: "Can I convert png to jpg on mobile?",
        a: "Yes. This png to jpg free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-picker": {
    keyword: "color picker free",
    articleTitle: "How to pick a color free",
    paragraphs: [
      "Use Color Picker free with this color picker. It picks a color and copies HEX, RGB, HSL, HSV, and CMYK.",
      "How to pick a color: click the color well or type a HEX code. Copy HEX, RGB, HSL, HSV, or CMYK from the result.",
      "This color picker free page is built for desktop and mobile. HEX Color Picker free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I pick a color?",
        a: "Click the color well or type a HEX code. Copy HEX, RGB, HSL, HSV, or CMYK from the result.",
      },
      {
        q: "Which formats can I copy?",
        a: "HEX, RGB, HSL, HSV, and CMYK. The color picker updates every format together.",
      },
      {
        q: "Is the color picker free?",
        a: "Yes. You can use color picker free with no signup and no software to install.",
      },
      {
        q: "Can I use color picker on mobile?",
        a: "Yes. This hex color picker free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "hex-to-rgb": {
    keyword: "hex to rgb converter free",
    articleTitle: "How to convert HEX to RGB free",
    paragraphs: [
      "Convert HEX to RGB free with this hex to rgb converter. It turns a hex code into rgb() you can copy instantly.",
      "How to convert HEX to RGB: paste a hex code such as #E8A33D. The RGB line updates instantly.",
      "This hex to rgb converter free page is built for desktop and mobile. HEX to RGB free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert HEX to RGB?",
        a: "Paste a hex code such as #E8A33D. The RGB line updates instantly.",
      },
      {
        q: "Does it accept 3-digit HEX?",
        a: "Yes. HEX accepts 3-digit or 6-digit codes. Copy rgb() from the result.",
      },
      {
        q: "Is the hex to rgb converter free?",
        a: "Yes. You can convert hex to rgb free with no signup and no software to install.",
      },
      {
        q: "Can I convert hex to rgb on mobile?",
        a: "Yes. This hex to rgb free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "rgb-to-hex": {
    keyword: "rgb to hex converter free",
    articleTitle: "How to convert RGB to HEX free",
    paragraphs: [
      "Convert RGB to HEX free with this rgb to hex converter. It turns RGB values into a six-digit hex code.",
      "How to convert RGB to HEX: enter 232, 163, 61 or rgb(). The HEX code updates instantly.",
      "This rgb to hex converter free page is built for desktop and mobile. RGB to HEX free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert RGB to HEX?",
        a: "Enter 232, 163, 61 or rgb(). The HEX code updates instantly.",
      },
      {
        q: "What RGB range is valid?",
        a: "RGB channels are 0–255. Copy a six-digit hex code from the result.",
      },
      {
        q: "Is the rgb to hex converter free?",
        a: "Yes. You can convert rgb to hex free with no signup and no software to install.",
      },
      {
        q: "Can I convert rgb to hex on mobile?",
        a: "Yes. This rgb to hex free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "hex-to-hsl": {
    keyword: "hex to hsl converter free",
    articleTitle: "How to convert HEX to HSL free",
    paragraphs: [
      "Convert HEX to HSL free with this hex to hsl converter. It turns a hex color into hue, saturation, and lightness.",
      "How to convert HEX to HSL: paste a hex code. Hue, saturation, and lightness appear on the right.",
      "This hex to hsl converter free page is built for desktop and mobile. HEX to HSL free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert HEX to HSL?",
        a: "Paste a hex code. Hue, saturation, and lightness appear on the right.",
      },
      {
        q: "What do the HSL numbers mean?",
        a: "Hue is 0–360. Saturation and lightness are percents 0–100.",
      },
      {
        q: "Is the hex to hsl converter free?",
        a: "Yes. You can convert hex to hsl free with no signup and no software to install.",
      },
      {
        q: "Can I convert hex to hsl on mobile?",
        a: "Yes. This hex to hsl free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "hsl-to-hex": {
    keyword: "hsl to hex converter free",
    articleTitle: "How to convert HSL to HEX free",
    paragraphs: [
      "Convert HSL to HEX free with this hsl to hex converter. It turns hue, saturation, and lightness into a hex code.",
      "How to convert HSL to HEX: enter hue, saturation, and lightness, or paste hsl(). The HEX code updates instantly.",
      "This hsl to hex converter free page is built for desktop and mobile. HSL to HEX free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert HSL to HEX?",
        a: "Enter hue, saturation, and lightness, or paste hsl(). The HEX code updates instantly.",
      },
      {
        q: "Can I paste an hsl() string?",
        a: "Yes. Enter channels or paste hsl() and copy the hex code.",
      },
      {
        q: "Is the hsl to hex converter free?",
        a: "Yes. You can convert hsl to hex free with no signup and no software to install.",
      },
      {
        q: "Can I convert hsl to hex on mobile?",
        a: "Yes. This hsl to hex free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "rgb-to-hsl": {
    keyword: "rgb to hsl converter free",
    articleTitle: "How to convert RGB to HSL free",
    paragraphs: [
      "Convert RGB to HSL free with this rgb to hsl converter. It turns RGB values into hsl() you can copy instantly.",
      "How to convert RGB to HSL: paste RGB channels. The HSL line updates instantly.",
      "This rgb to hsl converter free page is built for desktop and mobile. RGB to HSL free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert RGB to HSL?",
        a: "Paste RGB channels. The HSL line updates instantly.",
      },
      {
        q: "Is RGB 0–255?",
        a: "Yes. RGB is 0–255. Copy hsl() from the result.",
      },
      {
        q: "Is the rgb to hsl converter free?",
        a: "Yes. You can convert rgb to hsl free with no signup and no software to install.",
      },
      {
        q: "Can I convert rgb to hsl on mobile?",
        a: "Yes. This rgb to hsl free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-palette-generator": {
    keyword: "color palette generator free",
    articleTitle: "How to generate a palette free",
    paragraphs: [
      "Generate Color Palette free with this color palette generator. It builds a matching palette from a HEX color.",
      "How to generate a palette: enter a base HEX color. Copy the five matching HEX values from the result.",
      "This color palette generator free page is built for desktop and mobile. Color Scheme Generator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate a color palette?",
        a: "Enter a base HEX color. Copy the five matching HEX values from the result.",
      },
      {
        q: "How many colors are in the palette?",
        a: "You get a matching five-color palette from one HEX seed.",
      },
      {
        q: "Is the color palette generator free?",
        a: "Yes. You can generate color palette free with no signup and no software to install.",
      },
      {
        q: "Can I generate color palette on mobile?",
        a: "Yes. This color scheme generator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "gradient-generator": {
    keyword: "gradient generator free",
    articleTitle: "How to make a gradient free",
    paragraphs: [
      "Generate Gradient free with this gradient generator. It previews a linear or radial blend and copies the CSS.",
      "How to make a gradient: enter two HEX colors, pick linear or radial, then copy the CSS.",
      "This gradient generator free page is built for desktop and mobile. Linear Gradient Generator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I make a gradient?",
        a: "Enter two HEX colors, pick linear or radial, then copy the CSS.",
      },
      {
        q: "Can I make a radial gradient?",
        a: "Yes. Preview a linear or radial blend from two HEX colors and copy the CSS.",
      },
      {
        q: "Is the gradient generator free?",
        a: "Yes. You can generate gradient free with no signup and no software to install.",
      },
      {
        q: "Can I generate gradient on mobile?",
        a: "Yes. This linear gradient generator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "css-gradient-generator": {
    keyword: "css gradient generator free",
    articleTitle: "How to generate CSS gradient code free",
    paragraphs: [
      "Generate CSS Gradient free with this css gradient generator. It copies a background rule for linear, radial, or repeating gradients.",
      "How to generate CSS gradient code: enter two HEX colors, pick a type, then copy the background rule.",
      "This css gradient generator free page is built for desktop and mobile. CSS Linear Gradient free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate CSS gradient code?",
        a: "Enter two HEX colors, pick a type, then copy the background rule.",
      },
      {
        q: "Does it support repeating gradients?",
        a: "Yes. Copy a background rule for linear, radial, or repeating gradients.",
      },
      {
        q: "Is the css gradient generator free?",
        a: "Yes. You can generate css gradient free with no signup and no software to install.",
      },
      {
        q: "Can I generate css gradient on mobile?",
        a: "Yes. This css linear gradient free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-shades-generator": {
    keyword: "color shades generator free",
    articleTitle: "How to generate shades free",
    paragraphs: [
      "Generate Color Shades free with this color shades generator. It generates darker shades from any HEX color.",
      "How to generate shades: paste a HEX color. Copy the darker five-step scale.",
      "This color shades generator free page is built for desktop and mobile. Darker Shades free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate color shades?",
        a: "Paste a HEX color. Copy the darker five-step scale.",
      },
      {
        q: "Are shades darker than the original?",
        a: "Yes. Shades mix the color toward black. Tints are a separate page for lighter mixes.",
      },
      {
        q: "Is the color shades generator free?",
        a: "Yes. You can generate color shades free with no signup and no software to install.",
      },
      {
        q: "Can I generate color shades on mobile?",
        a: "Yes. This darker shades free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-tint-generator": {
    keyword: "color tint generator free",
    articleTitle: "How to generate tints free",
    paragraphs: [
      "Generate Color Tints free with this color tint generator. It generates lighter tints from any HEX color.",
      "How to generate tints: paste a HEX color. Copy the lighter five-step scale.",
      "This color tint generator free page is built for desktop and mobile. Lighter Tints free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate color tints?",
        a: "Paste a HEX color. Copy the lighter five-step scale.",
      },
      {
        q: "Are tints lighter than the original?",
        a: "Yes. Tints mix the color toward white. Shades are a separate page for darker mixes.",
      },
      {
        q: "Is the color tint generator free?",
        a: "Yes. You can generate color tints free with no signup and no software to install.",
      },
      {
        q: "Can I generate color tints on mobile?",
        a: "Yes. This lighter tints free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-tone-generator": {
    keyword: "color tone generator free",
    articleTitle: "How to generate tones free",
    paragraphs: [
      "Generate Color Tones free with this color tone generator. It generates muted tones from any HEX color.",
      "How to generate tones: paste a HEX color. Copy the muted five-step scale.",
      "This color tone generator free page is built for desktop and mobile. Muted Tones free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate color tones?",
        a: "Paste a HEX color. Copy the muted five-step scale.",
      },
      {
        q: "What is a color tone?",
        a: "Tones mix the color toward gray so the result is more muted than the seed.",
      },
      {
        q: "Is the color tone generator free?",
        a: "Yes. You can generate color tones free with no signup and no software to install.",
      },
      {
        q: "Can I generate color tones on mobile?",
        a: "Yes. This muted tones free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "complementary-color-generator": {
    keyword: "complementary colors free",
    articleTitle: "How to find complementary colors free",
    paragraphs: [
      "Find Complementary Colors free with this complementary colors. It finds the 180° opposite HEX color instantly.",
      "How to find complementary colors: paste a HEX code. Copy the seed and its opposite.",
      "This complementary colors free page is built for desktop and mobile. Opposite Color free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I find complementary colors?",
        a: "Paste a HEX code. Copy the seed and its opposite.",
      },
      {
        q: "What is a complementary color?",
        a: "It is the 180° opposite hue on the color wheel. Use it for strong contrast.",
      },
      {
        q: "Is the complementary colors free?",
        a: "Yes. You can find complementary colors free with no signup and no software to install.",
      },
      {
        q: "Can I find complementary colors on mobile?",
        a: "Yes. This opposite color free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "analogous-color-generator": {
    keyword: "analogous colors free",
    articleTitle: "How to generate analogous colors free",
    paragraphs: [
      "Generate Analogous Colors free with this analogous colors. It gets neighboring hues from a HEX seed.",
      "How to generate analogous colors: paste a HEX color. Copy the three neighboring hues.",
      "This analogous colors free page is built for desktop and mobile. Analogous Palette free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate analogous colors?",
        a: "Paste a HEX color. Copy the three neighboring hues.",
      },
      {
        q: "What are analogous colors?",
        a: "Analogous colors sit next to each other on the wheel, so the palette stays close in hue.",
      },
      {
        q: "Is the analogous colors free?",
        a: "Yes. You can generate analogous colors free with no signup and no software to install.",
      },
      {
        q: "Can I generate analogous colors on mobile?",
        a: "Yes. This analogous palette free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "triadic-color-generator": {
    keyword: "triadic colors free",
    articleTitle: "How to generate triadic colors free",
    paragraphs: [
      "Generate Triadic Colors free with this triadic colors. It gets three hues 120° apart from one HEX color.",
      "How to generate triadic colors: paste a HEX seed. Copy the three hues 120° apart.",
      "This triadic colors free page is built for desktop and mobile. Triadic Palette free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate triadic colors?",
        a: "Paste a HEX seed. Copy the three hues 120° apart.",
      },
      {
        q: "What is a triadic palette?",
        a: "Three hues equally spaced at 120° on the color wheel.",
      },
      {
        q: "Is the triadic colors free?",
        a: "Yes. You can generate triadic colors free with no signup and no software to install.",
      },
      {
        q: "Can I generate triadic colors on mobile?",
        a: "Yes. This triadic palette free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "split-complementary-generator": {
    keyword: "split complementary colors free",
    articleTitle: "How to generate split complementary colors free",
    paragraphs: [
      "Generate Split Complementary Colors free with this split complementary colors. It gets contrast with less clash from one HEX seed.",
      "How to generate split complementary colors: paste a HEX color. Copy the three HEX values.",
      "This split complementary colors free page is built for desktop and mobile. Split Complementary Palette free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate split complementary colors?",
        a: "Paste a HEX color. Copy the three HEX values.",
      },
      {
        q: "How is split complementary different from complementary?",
        a: "Split complementary uses the two hues beside the opposite color, so you get contrast with less clash.",
      },
      {
        q: "Is the split complementary colors free?",
        a: "Yes. You can generate split complementary colors free with no signup and no software to install.",
      },
      {
        q: "Can I generate split complementary colors on mobile?",
        a: "Yes. This split complementary palette free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "monochromatic-palette-generator": {
    keyword: "monochromatic palette free",
    articleTitle: "How to make a monochromatic palette free",
    paragraphs: [
      "Generate Monochromatic Palette free with this monochromatic palette. It builds five lightness steps from one hue.",
      "How to make a monochromatic palette: paste a HEX color. Copy the five lightness steps.",
      "This monochromatic palette free page is built for desktop and mobile. Single Hue Palette free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I make a monochromatic palette?",
        a: "Paste a HEX color. Copy the five lightness steps.",
      },
      {
        q: "Does a monochromatic palette use one hue?",
        a: "Yes. Same hue, five lightness steps, so the palette stays in one color family.",
      },
      {
        q: "Is the monochromatic palette free?",
        a: "Yes. You can generate monochromatic palette free with no signup and no software to install.",
      },
      {
        q: "Can I generate monochromatic palette on mobile?",
        a: "Yes. This single hue palette free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "random-color-generator": {
    keyword: "random color generator free",
    articleTitle: "How to generate a random color free",
    paragraphs: [
      "Generate Random Color free with this random color generator. It gives a random HEX, RGB, and HSL color instantly.",
      "How to generate a random color: click Generate. Copy HEX, RGB, HSL, HSV, or CMYK.",
      "This random color generator free page is built for desktop and mobile. Random HEX Color free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate a random color?",
        a: "Click Generate. Copy HEX, RGB, HSL, HSV, or CMYK.",
      },
      {
        q: "How random are the colors?",
        a: "Each click uses the browser cryptographic random number generator for three RGB channels.",
      },
      {
        q: "Is the random color generator free?",
        a: "Yes. You can generate random color free with no signup and no software to install.",
      },
      {
        q: "Can I generate random color on mobile?",
        a: "Yes. This random hex color free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-contrast-checker": {
    keyword: "color contrast checker free",
    articleTitle: "How to check contrast free",
    paragraphs: [
      "Check Color Contrast free with this color contrast checker. It shows the contrast ratio for text and background HEX.",
      "How to check contrast: enter text HEX and background HEX. Read the contrast ratio and pass or fail.",
      "This color contrast checker free page is built for desktop and mobile. Contrast Ratio Calculator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I check color contrast?",
        a: "Enter text HEX and background HEX. Read the contrast ratio and pass or fail.",
      },
      {
        q: "What is a good contrast ratio for text?",
        a: "Aim for at least 4.5:1 between text and background for body copy. This page reports the ratio and a simple pass or fail.",
      },
      {
        q: "Is the color contrast checker free?",
        a: "Yes. You can check color contrast free with no signup and no software to install.",
      },
      {
        q: "Can I check color contrast on mobile?",
        a: "Yes. This contrast ratio calculator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "wcag-contrast-checker": {
    keyword: "wcag contrast checker free",
    articleTitle: "How to check WCAG contrast free",
    paragraphs: [
      "Check WCAG Contrast free with this wcag contrast checker. It tests normal text, large text, and UI graphics for AA and AAA.",
      "How to check WCAG contrast: enter text and background HEX. Read AA and AAA for normal text, large text, and UI.",
      "This wcag contrast checker free page is built for desktop and mobile. WCAG AA free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I check WCAG contrast?",
        a: "Enter text and background HEX. Read AA and AAA for normal text, large text, and UI.",
      },
      {
        q: "What is the difference between AA and AAA?",
        a: "AAA is a stricter contrast target than AA. This page tests normal text, large text, and UI graphics for both.",
      },
      {
        q: "Is the wcag contrast checker free?",
        a: "Yes. You can check wcag contrast free with no signup and no software to install.",
      },
      {
        q: "Can I check wcag contrast on mobile?",
        a: "Yes. This wcag aa free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-blindness-simulator": {
    keyword: "color blindness simulator free",
    articleTitle: "How to simulate color blindness free",
    paragraphs: [
      "Simulate Color Blindness free with this color blindness simulator. It previews a HEX color with protanopia, deuteranopia, or tritanopia.",
      "How to simulate color blindness: paste a HEX color and pick protanopia, deuteranopia, or tritanopia.",
      "This color blindness simulator free page is built for desktop and mobile. Protanopia Simulator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I simulate color blindness?",
        a: "Paste a HEX color and pick protanopia, deuteranopia, or tritanopia.",
      },
      {
        q: "Is this a medical test?",
        a: "No. It is a design preview using a standard color matrix, not a diagnosis.",
      },
      {
        q: "Is the color blindness simulator free?",
        a: "Yes. You can simulate color blindness free with no signup and no software to install.",
      },
      {
        q: "Can I simulate color blindness on mobile?",
        a: "Yes. This protanopia simulator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "image-color-palette-extractor": {
    keyword: "extract colors from image free",
    articleTitle: "How to extract colors from an image free",
    paragraphs: [
      "Get Colors from Image free with this extract colors from image. It builds a HEX palette from an image in your browser.",
      "How to extract colors from an image: choose an image file. Copy the HEX swatches from the palette.",
      "This extract colors from image free page is built for desktop and mobile. Image Color Palette free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I extract colors from an image?",
        a: "Choose an image file. The page samples pixels locally and lists the most common HEX swatches.",
      },
      {
        q: "Are my images uploaded?",
        a: "No. Palette extraction runs in your browser. The file is not uploaded to a server.",
      },
      {
        q: "Is the extract colors from image free?",
        a: "Yes. You can get colors from image free with no signup and no software to install.",
      },
      {
        q: "Can I get colors from image on mobile?",
        a: "Yes. This image color palette free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "dominant-color-extractor": {
    keyword: "dominant color from image free",
    articleTitle: "How to find the dominant color free",
    paragraphs: [
      "Find Dominant Color free with this dominant color from image. It finds the most used color and copies HEX, RGB, and HSL.",
      "How to find the dominant color: choose an image file. Copy HEX, RGB, and HSL for the most used color.",
      "This dominant color from image free page is built for desktop and mobile. Dominant Color Extractor free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I find the dominant color in an image?",
        a: "Choose an image file. Copy HEX, RGB, and HSL for the most used color.",
      },
      {
        q: "Are my images uploaded?",
        a: "No. Dominant color extraction runs in your browser. The file is not uploaded to a server.",
      },
      {
        q: "Is the dominant color from image free?",
        a: "Yes. You can find dominant color free with no signup and no software to install.",
      },
      {
        q: "Can I find dominant color on mobile?",
        a: "Yes. This dominant color extractor free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-name-finder": {
    keyword: "hex to color name free",
    articleTitle: "How to find a color name free",
    paragraphs: [
      "Find Color Name free with this hex to color name. It finds the closest CSS color name for any HEX code.",
      "How to find a color name: paste a HEX code. The closest CSS name appears on the right.",
      "This hex to color name free page is built for desktop and mobile. Color Name Finder free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I find a color name from HEX?",
        a: "Paste a HEX code. The closest CSS name appears on the right.",
      },
      {
        q: "Are the names official CSS names?",
        a: "The page matches the closest CSS color name for the HEX you enter.",
      },
      {
        q: "Is the hex to color name free?",
        a: "Yes. You can find color name free with no signup and no software to install.",
      },
      {
        q: "Can I find color name on mobile?",
        a: "Yes. This color name finder free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-temperature-tool": {
    keyword: "warm or cool color free",
    articleTitle: "How to check warm or cool free",
    paragraphs: [
      "Check Warm or Cool Color free with this warm or cool color. It checks if a HEX color is warm, cool, or neutral.",
      "How to check warm or cool: paste a HEX color. Read warm, cool, or neutral plus hue and Kelvin.",
      "This warm or cool color free page is built for desktop and mobile. Warm Cool Color Checker free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I check if a color is warm or cool?",
        a: "Paste a HEX color. Read warm, cool, or neutral plus hue and Kelvin.",
      },
      {
        q: "Is this photography Kelvin?",
        a: "No. This page classifies a HEX color as warm, cool, or neutral. It is not a camera white-balance meter.",
      },
      {
        q: "Is the warm or cool color free?",
        a: "Yes. You can check warm or cool color free with no signup and no software to install.",
      },
      {
        q: "Can I check warm or cool color on mobile?",
        a: "Yes. This warm cool color checker free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "css-color-generator": {
    keyword: "css color code free",
    articleTitle: "How to generate CSS color code free",
    paragraphs: [
      "Generate CSS Color free with this css color code. It copies color, background-color, and a CSS variable from HEX.",
      "How to generate CSS color code: pick a color or paste HEX, then copy the CSS declarations.",
      "This css color code free page is built for desktop and mobile. CSS Color Code Generator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I generate CSS color code?",
        a: "Pick a color or paste HEX, then copy the CSS declarations.",
      },
      {
        q: "Which CSS properties can I copy?",
        a: "Copy color, background-color, and a CSS variable from HEX.",
      },
      {
        q: "Is the css color code free?",
        a: "Yes. You can generate css color free with no signup and no software to install.",
      },
      {
        q: "Can I generate css color on mobile?",
        a: "Yes. This css color code generator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "tailwind-color-converter": {
    keyword: "hex to tailwind free",
    articleTitle: "How to convert HEX to Tailwind free",
    paragraphs: [
      "Convert HEX to Tailwind free with this hex to tailwind. It finds the nearest token and class such as amber-500.",
      "How to convert HEX to Tailwind: paste a hex code. Copy the nearest token and class.",
      "This hex to tailwind free page is built for desktop and mobile. Tailwind Color Converter free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert HEX to Tailwind?",
        a: "Paste a hex code. Copy the nearest token and class.",
      },
      {
        q: "Does it match custom Tailwind themes?",
        a: "No. Matching uses the default Tailwind palette only, such as amber-500.",
      },
      {
        q: "Is the hex to tailwind free?",
        a: "Yes. You can convert hex to tailwind free with no signup and no software to install.",
      },
      {
        q: "Can I convert hex to tailwind on mobile?",
        a: "Yes. This tailwind color converter free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "ideal-weight-calculator": {
    keyword: "ideal weight calculator free",
    articleTitle: "How to calculate ideal weight free",
    paragraphs: [
      "Calculate Ideal Weight free with this ideal weight calculator. It uses the Devine formula first, then shows Robinson, Hamwi, and Miller plus a healthy BMI range (18.5–24.9).",
      "How to calculate ideal weight: choose sex, enter height, and read the kilograms and pounds on the right. Devine is 50 + 2.3 kg per inch over 5 feet for men, and 45.5 + 2.3 kg per inch over 5 feet for women.",
      "This ideal weight calculator free page is built for desktop and mobile. Ideal Body Weight Calculator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate ideal weight?",
        a: "Choose sex and enter height above. The result updates as you type. The ideal weight calculator runs in your browser.",
      },
      {
        q: "Which ideal weight formula does this use?",
        a: "The main result is Devine. Robinson, Hamwi, and Miller are listed next to it. A healthy BMI range of 18.5–24.9 is also shown from height.",
      },
      {
        q: "Is the ideal weight calculator free?",
        a: "Yes. You can calculate ideal weight free with no signup and no software to install.",
      },
      {
        q: "Can I calculate ideal weight on mobile?",
        a: "Yes. This ideal body weight calculator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "cagr-calculator": {
    keyword: "cagr calculator free",
    articleTitle: "How to calculate CAGR free",
    paragraphs: [
      "Calculate CAGR free with this cagr calculator. It finds compound annual growth rate from beginning value, ending value, and years.",
      "How to calculate CAGR: enter beginning value, ending value, and number of years. Formula: (ending ÷ beginning) ^ (1 ÷ years) − 1.",
      "This cagr calculator free page is built for desktop and mobile. Compound Annual Growth Rate Calculator free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I calculate CAGR?",
        a: "Enter beginning value, ending value, and years above. The result updates as you type. The CAGR calculator runs in your browser.",
      },
      {
        q: "What is the CAGR formula?",
        a: "CAGR = (ending value ÷ beginning value) raised to (1 ÷ years), then minus 1. Multiply by 100 for a percent.",
      },
      {
        q: "Is the cagr calculator free?",
        a: "Yes. You can calculate cagr free with no signup and no software to install.",
      },
      {
        q: "Can I calculate cagr on mobile?",
        a: "Yes. This compound annual growth rate calculator free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "find-and-replace": {
    keyword: "find and replace free",
    articleTitle: "How to find and replace text free",
    paragraphs: [
      "Find and Replace Text free with this find and replace. It replaces every match in pasted text, with or without matching case.",
      "How to find and replace text: paste text, enter the find string and the replacement, then copy the result. Matching is literal, not a regex.",
      "This find and replace free page is built for desktop and mobile. Find Replace Text Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I find and replace text?",
        a: "Paste text, enter Find and Replace with, then copy the updated text. The find and replace tool runs in your browser.",
      },
      {
        q: "Does find and replace support regular expressions?",
        a: "No. Matches are treated as plain text. Turn Match case on to keep capitalization, or leave it off for case-insensitive replacement.",
      },
      {
        q: "Is the find and replace free?",
        a: "Yes. You can find and replace text free with no signup and no software to install.",
      },
      {
        q: "Can I find and replace text on mobile?",
        a: "Yes. This find replace text online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "unix-timestamp-converter": {
    keyword: "unix timestamp converter free",
    articleTitle: "How to convert a Unix timestamp free",
    paragraphs: [
      "Convert Unix Timestamp free with this unix timestamp converter. It turns epoch seconds or milliseconds into UTC and local time.",
      "How to convert a Unix timestamp: paste a Unix value or pick a local date and time. Values with 13 or more digits are treated as milliseconds.",
      "This unix timestamp converter free page is built for desktop and mobile. Epoch Converter free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert a Unix timestamp?",
        a: "Paste a Unix timestamp or pick a local date and time above. Seconds, milliseconds, UTC, and local time update as you type.",
      },
      {
        q: "Does it accept milliseconds?",
        a: "Yes. A 13-digit value is treated as milliseconds. A 10-digit value is treated as seconds since 1 January 1970 UTC.",
      },
      {
        q: "Is the unix timestamp converter free?",
        a: "Yes. You can convert unix timestamp free with no signup and no software to install.",
      },
      {
        q: "Can I convert unix timestamp on mobile?",
        a: "Yes. This epoch converter free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "webp-to-jpg": {
    keyword: "webp to jpg converter free",
    articleTitle: "How to convert WebP to JPG free",
    paragraphs: [
      "Convert WebP to JPG free with this webp to jpg converter. It turns a WebP into a JPEG you can download instantly.",
      "How to convert WebP to JPG: add a WebP above, click Convert to JPG, then download the JPEG.",
      "This webp to jpg converter free page is built for desktop and mobile. WebP to JPG free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I convert WebP to JPG?",
        a: "Add a WebP above, click Convert to JPG, and download the JPEG. The WebP to JPG converter runs in your browser.",
      },
      {
        q: "Will transparent WebP stay transparent?",
        a: "No. JPEG does not support transparency. Transparent pixels are filled with white.",
      },
      {
        q: "Is the webp to jpg converter free?",
        a: "Yes. You can convert webp to jpg free with no signup and no software to install.",
      },
      {
        q: "Can I convert webp to jpg on mobile?",
        a: "Yes. This webp to jpg free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
  "color-mixer": {
    keyword: "color mixer free",
    articleTitle: "How to mix colors free",
    paragraphs: [
      "Mix Colors free with this color mixer. It blends two HEX colors by mix percent and copies HEX, RGB, and HSL.",
      "How to mix colors: enter Color A, Color B, and the mix percent of B. 0 keeps Color A. 100 keeps Color B. 50 is an even mix in RGB.",
      "This color mixer free page is built for desktop and mobile. Color Blender Online free means no account, no install, and no signup.",
    ],
    faqs: [
      {
        q: "How do I mix colors?",
        a: "Enter two HEX colors and a mix percent of Color B. The mixed HEX, RGB, HSL, HSV, and CMYK update as you type.",
      },
      {
        q: "How is the mixed color calculated?",
        a: "Each red, green, and blue channel is blended: result = A × (1 − t) + B × t, where t is mix percent of B divided by 100.",
      },
      {
        q: "Is the color mixer free?",
        a: "Yes. You can mix colors free with no signup and no software to install.",
      },
      {
        q: "Can I mix colors on mobile?",
        a: "Yes. This color blender online free tool works in a mobile browser. Open the page and get your result.",
      },
    ],
  },
};

export function getToolContent(slug: string): ToolContent | null {
  const tool = getTool(slug);
  if (!tool) return null;
  return guide(tool, custom[slug] ?? {});
}
