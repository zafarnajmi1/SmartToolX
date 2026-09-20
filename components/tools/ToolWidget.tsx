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
import {
  AnalogousColorGenerator,
  ColorBlindnessSimulator,
  ColorContrastChecker,
  ColorConverter,
  ColorNameFinder,
  ColorPaletteGenerator,
  ColorPicker,
  ColorShadesGenerator,
  ColorTemperatureTool,
  ColorTintGenerator,
  ColorToneGenerator,
  ComplementaryColorGenerator,
  CssColorGenerator,
  CssGradientGenerator,
  DominantColorExtractor,
  GradientGenerator,
  HexToHsl,
  HexToRgb,
  HslToHex,
  ImageColorPaletteExtractor,
  MonochromaticPaletteGenerator,
  RandomColorGenerator,
  RgbToHex,
  RgbToHsl,
  SplitComplementaryGenerator,
  TailwindColorConverter,
  TriadicColorGenerator,
  WcagContrastChecker,
} from "@/components/tools/ColorWidgets";

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
    case "color-picker":
      return <ColorPicker />;
    case "hex-to-rgb":
      return <HexToRgb />;
    case "rgb-to-hex":
      return <RgbToHex />;
    case "hex-to-hsl":
      return <HexToHsl />;
    case "hsl-to-hex":
      return <HslToHex />;
    case "rgb-to-hsl":
      return <RgbToHsl />;
    case "color-converter":
      return <ColorConverter />;
    case "color-palette-generator":
      return <ColorPaletteGenerator />;
    case "gradient-generator":
      return <GradientGenerator />;
    case "css-gradient-generator":
      return <CssGradientGenerator />;
    case "color-shades-generator":
      return <ColorShadesGenerator />;
    case "color-tint-generator":
      return <ColorTintGenerator />;
    case "color-tone-generator":
      return <ColorToneGenerator />;
    case "complementary-color-generator":
      return <ComplementaryColorGenerator />;
    case "analogous-color-generator":
      return <AnalogousColorGenerator />;
    case "triadic-color-generator":
      return <TriadicColorGenerator />;
    case "split-complementary-generator":
      return <SplitComplementaryGenerator />;
    case "monochromatic-palette-generator":
      return <MonochromaticPaletteGenerator />;
    case "random-color-generator":
      return <RandomColorGenerator />;
    case "color-contrast-checker":
      return <ColorContrastChecker />;
    case "wcag-contrast-checker":
      return <WcagContrastChecker />;
    case "color-blindness-simulator":
      return <ColorBlindnessSimulator />;
    case "image-color-palette-extractor":
      return <ImageColorPaletteExtractor />;
    case "dominant-color-extractor":
      return <DominantColorExtractor />;
    case "color-name-finder":
      return <ColorNameFinder />;
    case "color-temperature-tool":
      return <ColorTemperatureTool />;
    case "css-color-generator":
      return <CssColorGenerator />;
    case "tailwind-color-converter":
      return <TailwindColorConverter />;
    default:
      return null;
  }
}
