export type UnitDef = {
  id: string;
  label: string;
  factor: number;
};

export const unitCategories = {
  length: {
    label: "Length",
    units: [
      { id: "nm", label: "Nanometer (nm)", factor: 1e-9 },
      { id: "um", label: "Micrometer (µm)", factor: 1e-6 },
      { id: "mm", label: "Millimeter (mm)", factor: 0.001 },
      { id: "cm", label: "Centimeter (cm)", factor: 0.01 },
      { id: "dm", label: "Decimeter (dm)", factor: 0.1 },
      { id: "m", label: "Meter (m)", factor: 1 },
      { id: "km", label: "Kilometer (km)", factor: 1000 },
      { id: "in", label: "Inch (in)", factor: 0.0254 },
      { id: "ft", label: "Foot (ft)", factor: 0.3048 },
      { id: "yd", label: "Yard (yd)", factor: 0.9144 },
      { id: "mi", label: "Mile (mi)", factor: 1609.344 },
      { id: "nmi", label: "Nautical mile (nmi)", factor: 1852 },
    ],
  },
  weight: {
    label: "Weight",
    units: [
      { id: "ug", label: "Microgram (µg)", factor: 1e-9 },
      { id: "mg", label: "Milligram (mg)", factor: 0.000001 },
      { id: "g", label: "Gram (g)", factor: 0.001 },
      { id: "kg", label: "Kilogram (kg)", factor: 1 },
      { id: "q", label: "Quintal (q)", factor: 100 },
      { id: "t", label: "Metric ton (t)", factor: 1000 },
      { id: "oz", label: "Ounce (oz)", factor: 0.028349523125 },
      { id: "lb", label: "Pound (lb)", factor: 0.45359237 },
      { id: "st", label: "Stone (st)", factor: 6.35029318 },
      { id: "ton", label: "US ton (ton)", factor: 907.18474 },
      { id: "ukton", label: "UK ton (long)", factor: 1016.0469088 },
      { id: "ct", label: "Carat (ct)", factor: 0.0002 },
    ],
  },
  volume: {
    label: "Volume",
    units: [
      { id: "ml", label: "Milliliter (ml)", factor: 0.001 },
      { id: "cm3", label: "Cubic cm / cc", factor: 0.001 },
      { id: "l", label: "Liter (l)", factor: 1 },
      { id: "m3", label: "Cubic meter (m³)", factor: 1000 },
      { id: "in3", label: "Cubic inch (in³)", factor: 0.016387064 },
      { id: "ft3", label: "Cubic foot (ft³)", factor: 28.316846592 },
      { id: "tsp", label: "Teaspoon (tsp)", factor: 0.00492892159375 },
      { id: "tbsp", label: "Tablespoon (tbsp)", factor: 0.01478676478125 },
      { id: "floz", label: "US fl oz", factor: 0.0295735295625 },
      { id: "ukfloz", label: "UK fl oz", factor: 0.0284130625 },
      { id: "cup", label: "Cup (cup)", factor: 0.2365882365 },
      { id: "pt", label: "Pint (pt)", factor: 0.473176473 },
      { id: "qt", label: "Quart (qt)", factor: 0.946352946 },
      { id: "gal", label: "US gallon (gal)", factor: 3.785411784 },
      { id: "ukgal", label: "UK gallon (gal)", factor: 4.54609 },
      { id: "bbl", label: "Oil barrel (bbl)", factor: 158.987294928 },
    ],
  },
  temperature: {
    label: "Temperature",
    units: [
      { id: "C", label: "Celsius (°C)", factor: 1 },
      { id: "F", label: "Fahrenheit (°F)", factor: 1 },
      { id: "K", label: "Kelvin (K)", factor: 1 },
      { id: "R", label: "Rankine (°R)", factor: 1 },
    ],
  },
  area: {
    label: "Area",
    units: [
      { id: "mm2", label: "Square mm (mm²)", factor: 0.000001 },
      { id: "cm2", label: "Square cm (cm²)", factor: 0.0001 },
      { id: "m2", label: "Square meter (m²)", factor: 1 },
      { id: "a", label: "Are (a)", factor: 100 },
      { id: "ha", label: "Hectare (ha)", factor: 10000 },
      { id: "km2", label: "Square km (km²)", factor: 1_000_000 },
      { id: "in2", label: "Square inch (in²)", factor: 0.00064516 },
      { id: "ft2", label: "Square foot (ft²)", factor: 0.09290304 },
      { id: "yd2", label: "Square yard (yd²)", factor: 0.83612736 },
      { id: "acre", label: "Acre (acre)", factor: 4046.8564224 },
      { id: "mi2", label: "Square mile (mi²)", factor: 2_589_988.110336 },
    ],
  },
  speed: {
    label: "Speed",
    units: [
      { id: "mps", label: "Meters/sec (m/s)", factor: 1 },
      { id: "kph", label: "Kilometers/hour (km/h)", factor: 1000 / 3600 },
      { id: "mph", label: "Miles/hour (mph)", factor: 0.44704 },
      { id: "knot", label: "Knot (kn)", factor: 1852 / 3600 },
      { id: "fps", label: "Feet/sec (ft/s)", factor: 0.3048 },
    ],
  },
  time: {
    label: "Time",
    units: [
      { id: "ns", label: "Nanosecond (ns)", factor: 1e-9 },
      { id: "us", label: "Microsecond (µs)", factor: 1e-6 },
      { id: "ms", label: "Millisecond (ms)", factor: 0.001 },
      { id: "s", label: "Second (s)", factor: 1 },
      { id: "min", label: "Minute (min)", factor: 60 },
      { id: "h", label: "Hour (h)", factor: 3600 },
      { id: "day", label: "Day (d)", factor: 86400 },
      { id: "wk", label: "Week (wk)", factor: 604800 },
      { id: "mo", label: "Month (avg)", factor: 2629746 },
      { id: "yr", label: "Year (yr)", factor: 31556952 },
    ],
  },
  data: {
    label: "Data",
    units: [
      { id: "b", label: "Bit (b)", factor: 0.125 },
      { id: "B", label: "Byte (B)", factor: 1 },
      { id: "KB", label: "Kilobyte (KB)", factor: 1000 },
      { id: "MB", label: "Megabyte (MB)", factor: 1_000_000 },
      { id: "GB", label: "Gigabyte (GB)", factor: 1_000_000_000 },
      { id: "TB", label: "Terabyte (TB)", factor: 1_000_000_000_000 },
      { id: "PB", label: "Petabyte (PB)", factor: 1_000_000_000_000_000 },
      { id: "KiB", label: "Kibibyte (KiB)", factor: 1024 },
      { id: "MiB", label: "Mebibyte (MiB)", factor: 1_048_576 },
      { id: "GiB", label: "Gibibyte (GiB)", factor: 1_073_741_824 },
      { id: "TiB", label: "Tebibyte (TiB)", factor: 1_099_511_627_776 },
      { id: "PiB", label: "Pebibyte (PiB)", factor: 1_125_899_906_842_624 },
    ],
  },
  pressure: {
    label: "Pressure",
    units: [
      { id: "Pa", label: "Pascal (Pa)", factor: 1 },
      { id: "kPa", label: "Kilopascal (kPa)", factor: 1000 },
      { id: "hPa", label: "Hectopascal (hPa)", factor: 100 },
      { id: "mbar", label: "Millibar (mbar)", factor: 100 },
      { id: "bar", label: "Bar (bar)", factor: 100000 },
      { id: "psi", label: "PSI (psi)", factor: 6894.757293168 },
      { id: "atm", label: "Atmosphere (atm)", factor: 101325 },
      { id: "torr", label: "Torr / mmHg", factor: 133.322368421 },
      { id: "inHg", label: "Inch mercury (inHg)", factor: 3386.389 },
    ],
  },
  energy: {
    label: "Energy",
    units: [
      { id: "J", label: "Joule (J)", factor: 1 },
      { id: "kJ", label: "Kilojoule (kJ)", factor: 1000 },
      { id: "cal", label: "Calorie (cal)", factor: 4.184 },
      { id: "kcal", label: "Kilocalorie (kcal)", factor: 4184 },
      { id: "Wh", label: "Watt-hour (Wh)", factor: 3600 },
      { id: "kWh", label: "Kilowatt-hour (kWh)", factor: 3_600_000 },
      { id: "BTU", label: "BTU", factor: 1055.05585262 },
    ],
  },
  power: {
    label: "Power",
    units: [
      { id: "W", label: "Watt (W)", factor: 1 },
      { id: "kW", label: "Kilowatt (kW)", factor: 1000 },
      { id: "MW", label: "Megawatt (MW)", factor: 1_000_000 },
      { id: "hp", label: "Horsepower (hp)", factor: 745.699871582 },
      { id: "PS", label: "Metric hp (PS)", factor: 735.49875 },
    ],
  },
  angle: {
    label: "Angle",
    units: [
      { id: "deg", label: "Degree (°)", factor: Math.PI / 180 },
      { id: "rad", label: "Radian (rad)", factor: 1 },
      { id: "gon", label: "Gradian (gon)", factor: Math.PI / 200 },
      { id: "arcmin", label: "Arcminute (′)", factor: Math.PI / 10800 },
      { id: "arcsec", label: "Arcsecond (″)", factor: Math.PI / 648000 },
    ],
  },
} as const;

export type UnitKind = keyof typeof unitCategories;

function toKelvin(unit: string, value: number) {
  if (unit === "C") return value + 273.15;
  if (unit === "F") return ((value + 459.67) * 5) / 9;
  if (unit === "K") return value;
  if (unit === "R") return (value * 5) / 9;
  return null;
}

function fromKelvin(unit: string, kelvin: number) {
  if (unit === "C") return kelvin - 273.15;
  if (unit === "F") return (kelvin * 9) / 5 - 459.67;
  if (unit === "K") return kelvin;
  if (unit === "R") return (kelvin * 9) / 5;
  return null;
}

export function convertUnit(
  kind: UnitKind,
  fromId: string,
  toId: string,
  amount: number,
) {
  if (!Number.isFinite(amount)) return null;

  if (kind === "temperature") {
    const kelvin = toKelvin(fromId, amount);
    if (kelvin == null || kelvin < 0) return null;
    if (fromId === toId) return amount;
    return fromKelvin(toId, kelvin);
  }

  if (fromId === toId) return amount;

  const units = unitCategories[kind].units as readonly UnitDef[];
  const from = units.find((unit) => unit.id === fromId);
  const to = units.find((unit) => unit.id === toId);
  if (!from || !to || to.factor === 0) return null;
  return (amount * from.factor) / to.factor;
}

export function formatConverted(value: number) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs === 0) return "0";
  const snapped = Math.round(value * 1e12) / 1e12;
  const snappedAbs = Math.abs(snapped);
  if (snappedAbs >= 1_000_000 || snappedAbs < 0.0001) {
    return snapped.toExponential(4);
  }
  if (snappedAbs >= 100) return snapped.toFixed(2);
  if (snappedAbs >= 1) return snapped.toFixed(4);
  return snapped.toFixed(6);
}
