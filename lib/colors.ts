export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };
export type HSV = { h: number; s: number; v: number };
export type CMYK = { c: number; m: number; y: number; k: number };

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function parseHex(input: string): RGB | null {
  let clean = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(clean)) {
    clean = clean
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null;
  const n = Number.parseInt(clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB) {
  const hex = [r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex.toUpperCase()}`;
}

/** Mix two sRGB colors in channel space. `amount` 0 = all A, 1 = all B. */
export function mixRgb(a: RGB, b: RGB, amount: number): RGB {
  const t = clamp(amount, 0, 1);
  return {
    r: clamp(Math.round(a.r * (1 - t) + b.r * t), 0, 255),
    g: clamp(Math.round(a.g * (1 - t) + b.g * t), 0, 255),
    b: clamp(Math.round(a.b * (1 - t) + b.b * t), 0, 255),
  };
}

export function parseRgb(input: string): RGB | null {
  const match = input.trim().match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (match) {
    return {
      r: clamp(Number(match[1]), 0, 255),
      g: clamp(Number(match[2]), 0, 255),
      b: clamp(Number(match[3]), 0, 255),
    };
  }
  const parts = input.split(/[,\s]+/).filter(Boolean);
  if (parts.length !== 3) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n))) return null;
  return {
    r: clamp(nums[0], 0, 255),
    g: clamp(nums[1], 0, 255),
    b: clamp(nums[2], 0, 255),
  };
}

export function parseHsl(input: string): HSL | null {
  const match = input
    .trim()
    .match(/^hsla?\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)%?\s*,\s*(-?[\d.]+)%?/i);
  if (match) {
    return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
  }
  const parts = input
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map((part) => Number(part.replace("%", "")));
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return null;
  return { h: parts[0], s: parts[1], l: parts[2] };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (hn < 60) [rn, gn, bn] = [c, x, 0];
  else if (hn < 120) [rn, gn, bn] = [x, c, 0];
  else if (hn < 180) [rn, gn, bn] = [0, c, x];
  else if (hn < 240) [rn, gn, bn] = [0, x, c];
  else if (hn < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  return { h, s, v: max * 100 };
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const hn = (((h % 360) + 360) % 360) / 60;
  const sn = clamp(s, 0, 100) / 100;
  const vn = clamp(v, 0, 100) / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs((hn % 2) - 1));
  const m = vn - c;
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (hn < 1) [rn, gn, bn] = [c, x, 0];
  else if (hn < 2) [rn, gn, bn] = [x, c, 0];
  else if (hn < 3) [rn, gn, bn] = [0, c, x];
  else if (hn < 4) [rn, gn, bn] = [0, x, c];
  else if (hn < 5) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: ((1 - rn - k) / (1 - k)) * 100,
    m: ((1 - gn - k) / (1 - k)) * 100,
    y: ((1 - bn - k) / (1 - k)) * 100,
    k: k * 100,
  };
}

export function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  const cn = clamp(c, 0, 100) / 100;
  const mn = clamp(m, 0, 100) / 100;
  const yn = clamp(y, 0, 100) / 100;
  const kn = clamp(k, 0, 100) / 100;
  return {
    r: Math.round(255 * (1 - cn) * (1 - kn)),
    g: Math.round(255 * (1 - mn) * (1 - kn)),
    b: Math.round(255 * (1 - yn) * (1 - kn)),
  };
}

export function formatRgb({ r, g, b }: RGB) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function formatHsl({ h, s, l }: HSL) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function formatHsv({ h, s, v }: HSV) {
  return `hsv(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(v)}%)`;
}

export function formatCmyk({ c, m, y, k }: CMYK) {
  return `cmyk(${Math.round(c)}%, ${Math.round(m)}%, ${Math.round(y)}%, ${Math.round(k)}%)`;
}

export type ColorSet = {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  cmyk: CMYK;
};

export function fromRgb(rgb: RGB): ColorSet {
  const clamped = {
    r: clamp(Math.round(rgb.r), 0, 255),
    g: clamp(Math.round(rgb.g), 0, 255),
    b: clamp(Math.round(rgb.b), 0, 255),
  };
  return {
    hex: rgbToHex(clamped),
    rgb: clamped,
    hsl: rgbToHsl(clamped),
    hsv: rgbToHsv(clamped),
    cmyk: rgbToCmyk(clamped),
  };
}

export function parseColor(input: string): ColorSet | null {
  const hex = parseHex(input);
  if (hex) return fromRgb(hex);
  const rgb = parseRgb(input);
  if (rgb) return fromRgb(rgb);
  const hsl = parseHsl(input);
  if (hsl) return fromRgb(hslToRgb(hsl));
  return null;
}

function shiftHue(hsl: HSL, deg: number): HSL {
  return { ...hsl, h: (((hsl.h + deg) % 360) + 360) % 360 };
}

export function complementary(rgb: RGB) {
  return [fromRgb(rgb), fromRgb(hslToRgb(shiftHue(rgbToHsl(rgb), 180)))];
}

export function analogous(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  return [
    fromRgb(hslToRgb(shiftHue(hsl, -30))),
    fromRgb(rgb),
    fromRgb(hslToRgb(shiftHue(hsl, 30))),
  ];
}

export function triadic(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  return [0, 120, 240].map((deg) => fromRgb(hslToRgb(shiftHue(hsl, deg))));
}

export function splitComplementary(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  return [
    fromRgb(rgb),
    fromRgb(hslToRgb(shiftHue(hsl, 150))),
    fromRgb(hslToRgb(shiftHue(hsl, 210))),
  ];
}

export function monochromatic(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  return [18, 34, 50, 66, 82].map((l) => fromRgb(hslToRgb({ ...hsl, l })));
}

export function shades(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  return [0, 1, 2, 3, 4].map((step) =>
    fromRgb(hslToRgb({ ...hsl, l: clamp(hsl.l - step * 12, 4, 96) })),
  );
}

export function tints(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  return [0, 1, 2, 3, 4].map((step) =>
    fromRgb(hslToRgb({ ...hsl, l: clamp(hsl.l + step * 12, 4, 96) })),
  );
}

export function tones(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  return [0, 1, 2, 3, 4].map((step) =>
    fromRgb(hslToRgb({ ...hsl, s: clamp(hsl.s - step * 16, 0, 100) })),
  );
}

export function paletteFromSeed(rgb: RGB) {
  const hsl = rgbToHsl(rgb);
  return [
    fromRgb(rgb),
    fromRgb(hslToRgb(shiftHue(hsl, 28))),
    fromRgb(hslToRgb(shiftHue(hsl, 180))),
    fromRgb(hslToRgb({ ...hsl, l: clamp(hsl.l + 18, 8, 92) })),
    fromRgb(hslToRgb({ ...hsl, l: clamp(hsl.l - 18, 8, 92) })),
  ];
}

export function randomRgb(): RGB {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return { r: bytes[0], g: bytes[1], b: bytes[2] };
}

function srgbToLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function colorTemperature(rgb: RGB) {
  const R = srgbToLinear(rgb.r);
  const G = srgbToLinear(rgb.g);
  const B = srgbToLinear(rgb.b);
  const X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
  const sum = X + Y + Z;
  let kelvin = 6500;
  if (sum > 0) {
    const x = X / sum;
    const y = Y / sum;
    const n = (x - 0.332) / (0.1858 - y);
    kelvin = 449 * n ** 3 + 3525 * n ** 2 + 6823.3 * n + 5520.33;
  }
  const hsl = rgbToHsl(rgb);
  let label: "warm" | "cool" | "neutral" = "neutral";
  if (hsl.s < 10) label = "neutral";
  else if (hsl.h < 75 || hsl.h >= 345) label = "warm";
  else if (hsl.h >= 90 && hsl.h <= 270) label = "cool";
  return {
    kelvin: Math.round(clamp(kelvin, 1000, 25000)),
    label,
    hue: Math.round(hsl.h),
  };
}

export function relativeLuminance({ r, g, b }: RGB) {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

export function contrastRatio(a: RGB, b: RGB) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

export function wcagRating(ratio: number) {
  return {
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

type BlindKind = "protanopia" | "deuteranopia" | "tritanopia";

const BLIND_MATRICES: Record<BlindKind, number[][]> = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
};

export function simulateBlindness(rgb: RGB, kind: BlindKind): RGB {
  const m = BLIND_MATRICES[kind];
  return {
    r: clamp(Math.round(rgb.r * m[0][0] + rgb.g * m[0][1] + rgb.b * m[0][2]), 0, 255),
    g: clamp(Math.round(rgb.r * m[1][0] + rgb.g * m[1][1] + rgb.b * m[1][2]), 0, 255),
    b: clamp(Math.round(rgb.r * m[2][0] + rgb.g * m[2][1] + rgb.b * m[2][2]), 0, 255),
  };
}

export const CSS_COLOR_NAMES: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#FF0000",
  lime: "#00FF00",
  blue: "#0000FF",
  yellow: "#FFFF00",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  silver: "#C0C0C0",
  gray: "#808080",
  maroon: "#800000",
  olive: "#808000",
  green: "#008000",
  purple: "#800080",
  teal: "#008080",
  navy: "#000080",
  orange: "#FFA500",
  gold: "#FFD700",
  coral: "#FF7F50",
  tomato: "#FF6347",
  salmon: "#FA8072",
  khaki: "#F0E68C",
  violet: "#EE82EE",
  orchid: "#DA70D6",
  plum: "#DDA0DD",
  indigo: "#4B0082",
  turquoise: "#40E0D0",
  skyblue: "#87CEEB",
  steelblue: "#4682B4",
  royalblue: "#4169E1",
  navyblue: "#000080",
  crimson: "#DC143C",
  chocolate: "#D2691E",
  peru: "#CD853F",
  tan: "#D2B48C",
  wheat: "#F5DEB3",
  beige: "#F5F5DC",
  ivory: "#FFFFF0",
  snow: "#FFFAFA",
  azure: "#F0FFFF",
  mintcream: "#F5FFFA",
  lavender: "#E6E6FA",
  pink: "#FFC0CB",
  hotpink: "#FF69B4",
  deeppink: "#FF1493",
  brown: "#A52A2A",
  sienna: "#A0522D",
  seagreen: "#2E8B57",
  forestgreen: "#228B22",
  darkslategray: "#2F4F4F",
  slategray: "#708090",
  dimgray: "#696969",
  lightgray: "#D3D3D3",
  amber: "#E8A33D",
};

function hexDistance(a: RGB, b: RGB) {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

export function nearestColorName(rgb: RGB) {
  let best = "black";
  let bestDist = Infinity;
  for (const [name, hex] of Object.entries(CSS_COLOR_NAMES)) {
    const parsed = parseHex(hex);
    if (!parsed) continue;
    const dist = hexDistance(rgb, parsed);
    if (dist < bestDist) {
      bestDist = dist;
      best = name;
    }
  }
  return best;
}

const TW_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const TW_PALETTES: Record<string, string[]> = {
  slate: ["#F8FAFC", "#F1F5F9", "#E2E8F0", "#CBD5E1", "#94A3B8", "#64748B", "#475569", "#334155", "#1E293B", "#0F172A", "#020617"],
  gray: ["#F9FAFB", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563", "#374151", "#1F2937", "#111827", "#030712"],
  zinc: ["#FAFAFA", "#F4F4F5", "#E4E4E7", "#D4D4D8", "#A1A1AA", "#71717A", "#52525B", "#3F3F46", "#27272A", "#18181B", "#09090B"],
  red: ["#FEF2F2", "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D", "#450A0A"],
  orange: ["#FFF7ED", "#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C", "#F97316", "#EA580C", "#C2410C", "#9A3412", "#7C2D12", "#431407"],
  amber: ["#FFFBEB", "#FEF3C7", "#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F", "#451A03"],
  yellow: ["#FEFCE8", "#FEF9C3", "#FEF08A", "#FDE047", "#FACC15", "#EAB308", "#CA8A04", "#A16207", "#854D0E", "#713F12", "#422006"],
  lime: ["#F7FEE7", "#ECFCCB", "#D9F99D", "#BEF264", "#A3E635", "#84CC16", "#65A30D", "#4D7C0F", "#3F6212", "#365314", "#1A2E05"],
  green: ["#F0FDF4", "#DCFCE7", "#BBF7D0", "#86EFAC", "#4ADE80", "#22C55E", "#16A34A", "#15803D", "#166534", "#14532D", "#052E16"],
  emerald: ["#ECFDF5", "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399", "#10B981", "#059669", "#047857", "#065F46", "#064E3B", "#022C22"],
  teal: ["#F0FDFA", "#CCFBF1", "#99F6E4", "#5EEAD4", "#2DD4BF", "#14B8A6", "#0D9488", "#0F766E", "#115E59", "#134E4A", "#042F2E"],
  cyan: ["#ECFEFF", "#CFFAFE", "#A5F3FC", "#67E8F9", "#22D3EE", "#06B6D4", "#0891B2", "#0E7490", "#155E75", "#164E63", "#083344"],
  sky: ["#F0F9FF", "#E0F2FE", "#BAE6FD", "#7DD3FC", "#38BDF8", "#0EA5E9", "#0284C7", "#0369A1", "#075985", "#0C4A6E", "#082F49"],
  blue: ["#EFF6FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A", "#172554"],
  indigo: ["#EEF2FF", "#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8", "#6366F1", "#4F46E5", "#4338CA", "#3730A3", "#312E81", "#1E1B4B"],
  violet: ["#F5F3FF", "#EDE9FE", "#DDD6FE", "#C4B5FD", "#A78BFA", "#8B5CF6", "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95", "#2E1065"],
  purple: ["#FAF5FF", "#F3E8FF", "#E9D5FF", "#D8B4FE", "#C084FC", "#A855F7", "#9333EA", "#7E22CE", "#6B21A8", "#581C87", "#3B0764"],
  fuchsia: ["#FDF4FF", "#FAE8FF", "#F5D0FE", "#F0ABFC", "#E879F9", "#D946EF", "#C026D3", "#A21CAF", "#86198F", "#701A75", "#4A044E"],
  pink: ["#FDF2F8", "#FCE7F3", "#FBCFE8", "#F9A8D4", "#F472B6", "#EC4899", "#DB2777", "#BE185D", "#9D174D", "#831843", "#500724"],
  rose: ["#FFF1F2", "#FFE4E6", "#FECDD3", "#FEA3B4", "#FB7185", "#F43F5E", "#E11D48", "#BE123C", "#9F1239", "#881337", "#4C0519"],
};

export function nearestTailwind(rgb: RGB) {
  let best = "slate-500";
  let bestHex = "#64748B";
  let bestDist = Infinity;
  for (const [name, steps] of Object.entries(TW_PALETTES)) {
    steps.forEach((hex, index) => {
      const parsed = parseHex(hex);
      if (!parsed) return;
      const dist = hexDistance(rgb, parsed);
      if (dist < bestDist) {
        bestDist = dist;
        best = `${name}-${TW_STEPS[index]}`;
        bestHex = hex;
      }
    });
  }
  return { token: best, hex: bestHex, className: `bg-${best}` };
}

export function extractPalette(data: Uint8ClampedArray, count = 6) {
  const buckets = new Map<string, { rgb: RGB; n: number }>();
  for (let i = 0; i < data.length; i += 16) {
    const a = data[i + 3];
    if (a < 128) continue;
    const rgb = {
      r: data[i] & 0xf0,
      g: data[i + 1] & 0xf0,
      b: data[i + 2] & 0xf0,
    };
    const key = `${rgb.r}-${rgb.g}-${rgb.b}`;
    const current = buckets.get(key);
    if (current) current.n += 1;
    else buckets.set(key, { rgb, n: 1 });
  }
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((item) => fromRgb(item.rgb));
}
