import { FileConverter } from "@/components/tools/FileConverter";
import {
  AgeCalculator,
  BmiCalculator,
  CurrencyConverter,
  LoanEmiCalculator,
  PercentageCalculator,
  QrCodeGenerator,
  UnitConverter,
  WordCounter,
} from "@/components/tools/ToolWidgets";
import {
  Base64Encoder,
  BinaryConverter,
  BmrCalculator,
  BodyFatCalculator,
  CalorieCalculator,
  CaseConverter,
  ColorConverter,
  CompoundInterestCalculator,
  DateDifferenceCalculator,
  DiscountCalculator,
  GstCalculator,
  LoremIpsumGenerator,
  NumberToWords,
  OvulationCalculator,
  PasswordGenerator,
  PregnancyDueDateCalculator,
  RomanNumeralConverter,
  SimpleInterestCalculator,
  SipCalculator,
  SlugGenerator,
  TemperatureConverterWidget,
  TextReverser,
  TimeCalculatorWidget,
  TipCalculator,
  WaterIntakeCalculator,
  PeriodCalculator,
  FdCalculator,
  JsonFormatter,
  TimeZoneConverter,
  SleepCalculator,
  MortgageCalculator,
  RandomNumberGenerator,
  GpaCalculator,
} from "@/components/tools/ExtraWidgets";

export function ToolWidget({ slug }: { slug: string }) {
  switch (slug) {
    case "bmi-calculator":
      return <BmiCalculator />;
    case "percentage-calculator":
      return <PercentageCalculator />;
    case "loan-emi-calculator":
      return <LoanEmiCalculator />;
    case "word-counter":
      return <WordCounter />;
    case "currency-converter":
      return <CurrencyConverter />;
    case "age-calculator":
      return <AgeCalculator />;
    case "qr-code-generator":
      return <QrCodeGenerator />;
    case "unit-converter":
      return <UnitConverter />;
    case "calorie-calculator":
      return <CalorieCalculator />;
    case "bmr-calculator":
      return <BmrCalculator />;
    case "body-fat-calculator":
      return <BodyFatCalculator />;
    case "pregnancy-due-date-calculator":
      return <PregnancyDueDateCalculator />;
    case "ovulation-calculator":
      return <OvulationCalculator />;
    case "water-intake-calculator":
      return <WaterIntakeCalculator />;
    case "period-calculator":
      return <PeriodCalculator />;
    case "compound-interest-calculator":
      return <CompoundInterestCalculator />;
    case "gst-calculator":
      return <GstCalculator />;
    case "tip-calculator":
      return <TipCalculator />;
    case "discount-calculator":
      return <DiscountCalculator />;
    case "sip-calculator":
      return <SipCalculator />;
    case "simple-interest-calculator":
      return <SimpleInterestCalculator />;
    case "fd-calculator":
      return <FdCalculator />;
    case "case-converter":
      return <CaseConverter />;
    case "password-generator":
      return <PasswordGenerator />;
    case "lorem-ipsum-generator":
      return <LoremIpsumGenerator />;
    case "text-reverser":
      return <TextReverser />;
    case "base64-encoder":
      return <Base64Encoder />;
    case "slug-generator":
      return <SlugGenerator />;
    case "json-formatter":
      return <JsonFormatter />;
    case "temperature-converter":
      return <TemperatureConverterWidget />;
    case "number-to-words":
      return <NumberToWords />;
    case "binary-converter":
      return <BinaryConverter />;
    case "color-converter":
      return <ColorConverter />;
    case "roman-numeral-converter":
      return <RomanNumeralConverter />;
    case "time-calculator":
      return <TimeCalculatorWidget />;
    case "date-difference-calculator":
      return <DateDifferenceCalculator />;
    case "time-zone-converter":
      return <TimeZoneConverter />;
    case "pdf-to-word":
      return <FileConverter id="pdf-to-word" />;
    case "word-to-pdf":
      return <FileConverter id="word-to-pdf" />;
    case "pdf-to-jpg":
      return <FileConverter id="pdf-to-jpg" />;
    case "jpg-to-pdf":
      return <FileConverter id="jpg-to-pdf" />;
    case "excel-to-pdf":
      return <FileConverter id="excel-to-pdf" />;
    case "ppt-to-pdf":
      return <FileConverter id="ppt-to-pdf" />;
    case "compress-pdf":
      return <FileConverter id="compress-pdf" />;
    case "merge-pdf":
      return <FileConverter id="merge-pdf" />;
    case "pdf-to-png":
      return <FileConverter id="pdf-to-png" />;
    case "png-to-pdf":
      return <FileConverter id="png-to-pdf" />;
    case "split-pdf":
      return <FileConverter id="split-pdf" />;
    case "sleep-calculator":
      return <SleepCalculator />;
    case "mortgage-calculator":
      return <MortgageCalculator />;
    case "random-number-generator":
      return <RandomNumberGenerator />;
    case "gpa-calculator":
      return <GpaCalculator />;
    case "png-to-jpg":
      return <FileConverter id="png-to-jpg" />;
    default:
      return null;
  }
}
