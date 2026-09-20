"use client";

import { useMemo, useState } from "react";
import { Field, Input, Result, Select } from "@/components/ui/Form";
import {
  analogous,
  complementary,
  contrastRatio,
  colorTemperature,
  extractPalette,
  formatCmyk,
  formatHsl,
  formatHsv,
  formatRgb,
  fromRgb,
  hslToRgb,
  hsvToRgb,
  monochromatic,
  nearestColorName,
  nearestTailwind,
  parseColor,
  parseHex,
  parseHsl,
  parseRgb,
  paletteFromSeed,
  randomRgb,
  shades,
  simulateBlindness,
  splitComplementary,
  tints,
  tones,
  triadic,
  wcagRating,
  cmykToRgb,
  type ColorSet,
  type RGB,
} from "@/lib/colors";

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-line bg-bg flex flex-col justify-center gap-6 rounded-[6px] border px-[26px] py-[22px]">
      {children}
    </div>
  );
}

function Swatch({ hex }: { hex: string }) {
  return (
    <div
      className="border-line size-8 shrink-0 rounded-[4px] border"
      style={{ background: hex }}
      aria-hidden
    />
  );
}

function ColorResults({ color }: { color: ColorSet | null }) {
  return (
    <Box>
      <div className="flex items-center gap-3">
        <Swatch hex={color?.hex ?? "#14171C"} />
        <Result label="HEX" value={color?.hex ?? "—"} steel />
      </div>
      <Result label="RGB" value={color ? formatRgb(color.rgb) : "—"} />
      <Result label="HSL" value={color ? formatHsl(color.hsl) : "—"} steel />
      <Result label="HSV" value={color ? formatHsv(color.hsv) : "—"} />
      <Result label="CMYK" value={color ? formatCmyk(color.cmyk) : "—"} steel />
    </Box>
  );
}

function PaletteRow({ colors }: { colors: ColorSet[] }) {
  if (colors.length === 0) {
    return (
      <Box>
        <Result label="Palette" value="—" steel />
      </Box>
    );
  }
  return (
    <Box>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <div key={color.hex} className="flex items-center gap-2">
            <Swatch hex={color.hex} />
            <span className="font-mono text-[13px]">{color.hex}</span>
          </div>
        ))}
      </div>
    </Box>
  );
}

function HexField({
  value,
  onChange,
  label = "HEX",
  placeholder = "#E8A33D",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function HexPaletteTool({ compute }: { compute: (rgb: RGB) => ColorSet[] }) {
  const [hex, setHex] = useState("");
  const colors = useMemo(() => {
    const parsed = parseHex(hex);
    return parsed ? compute(parsed) : [];
  }, [hex, compute]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <HexField value={hex} onChange={setHex} />
      <PaletteRow colors={colors} />
    </div>
  );
}

function rgbFromValue(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return parseRgb(trimmed.includes("(") ? trimmed : `rgb(${trimmed})`);
}

async function colorsFromImage(file: File, count = 6) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 160 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read this image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return extractPalette(image.data, count);
}

export function ColorPicker() {
  const [hex, setHex] = useState("#E8A33D");
  const color = useMemo(() => parseColor(hex), [hex]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Pick a color">
          <Input
            type="color"
            value={color?.hex ?? "#E8A33D"}
            onChange={(e) => setHex(e.target.value)}
          />
        </Field>
        <HexField value={hex} onChange={setHex} />
      </div>
      <ColorResults color={color} />
    </div>
  );
}

export function HexToRgb() {
  const [hex, setHex] = useState("");
  const color = useMemo(() => {
    const parsed = parseHex(hex);
    return parsed ? fromRgb(parsed) : null;
  }, [hex]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <HexField value={hex} onChange={setHex} />
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={color?.hex ?? "#14171C"} />
          <Result label="RGB" value={color ? formatRgb(color.rgb) : "—"} steel />
        </div>
      </Box>
    </div>
  );
}

export function RgbToHex() {
  const [value, setValue] = useState("");
  const color = useMemo(() => {
    const parsed = rgbFromValue(value);
    return parsed ? fromRgb(parsed) : null;
  }, [value]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="RGB">
        <Input
          value={value}
          placeholder="232, 163, 61"
          onChange={(e) => setValue(e.target.value)}
        />
      </Field>
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={color?.hex ?? "#14171C"} />
          <Result label="HEX" value={color?.hex ?? "—"} steel />
        </div>
      </Box>
    </div>
  );
}

export function HexToHsl() {
  const [hex, setHex] = useState("");
  const color = useMemo(() => {
    const parsed = parseHex(hex);
    return parsed ? fromRgb(parsed) : null;
  }, [hex]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <HexField value={hex} onChange={setHex} />
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={color?.hex ?? "#14171C"} />
          <Result label="HSL" value={color ? formatHsl(color.hsl) : "—"} steel />
        </div>
      </Box>
    </div>
  );
}

export function HslToHex() {
  const [value, setValue] = useState("");
  const color = useMemo(() => {
    const parsed = parseHsl(value);
    return parsed ? fromRgb(hslToRgb(parsed)) : null;
  }, [value]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="HSL">
        <Input
          value={value}
          placeholder="38, 79, 57"
          onChange={(e) => setValue(e.target.value)}
        />
      </Field>
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={color?.hex ?? "#14171C"} />
          <Result label="HEX" value={color?.hex ?? "—"} steel />
        </div>
      </Box>
    </div>
  );
}

export function RgbToHsl() {
  const [value, setValue] = useState("");
  const color = useMemo(() => {
    const parsed = rgbFromValue(value);
    return parsed ? fromRgb(parsed) : null;
  }, [value]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="RGB">
        <Input
          value={value}
          placeholder="232, 163, 61"
          onChange={(e) => setValue(e.target.value)}
        />
      </Field>
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={color?.hex ?? "#14171C"} />
          <Result label="HSL" value={color ? formatHsl(color.hsl) : "—"} steel />
        </div>
      </Box>
    </div>
  );
}

export function ColorConverter() {
  const [mode, setMode] = useState("hex");
  const [value, setValue] = useState("");
  const color = useMemo(() => {
    const raw = value.trim();
    if (!raw) return null;
    if (mode === "hex") return parseColor(raw);
    if (mode === "rgb") return parseColor(raw.includes("(") ? raw : `rgb(${raw})`);
    if (mode === "hsl") {
      const parsed = parseHsl(raw);
      return parsed ? fromRgb(hslToRgb(parsed)) : null;
    }
    if (mode === "hsv") {
      const parts = raw.split(/[,\s]+/).map(Number);
      if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return null;
      return fromRgb(hsvToRgb({ h: parts[0], s: parts[1], v: parts[2] }));
    }
    const parts = raw.split(/[,\s]+/).map(Number);
    if (parts.length < 4 || parts.some((n) => !Number.isFinite(n))) return null;
    return fromRgb(cmykToRgb({ c: parts[0], m: parts[1], y: parts[2], k: parts[3] }));
  }, [mode, value]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="From">
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
            <option value="hsv">HSV</option>
            <option value="cmyk">CMYK</option>
          </Select>
        </Field>
        <Field label="Value">
          <Input
            value={value}
            placeholder={
              mode === "hex"
                ? "#E8A33D"
                : mode === "rgb"
                  ? "232, 163, 61"
                  : mode === "cmyk"
                    ? "0, 30, 74, 9"
                    : "38, 79, 57"
            }
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
      </div>
      <ColorResults color={color} />
    </div>
  );
}

export function ColorPaletteGenerator() {
  const [hex, setHex] = useState("");
  const colors = useMemo(() => {
    const parsed = parseHex(hex);
    return parsed ? paletteFromSeed(parsed) : [];
  }, [hex]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <HexField value={hex} onChange={setHex} label="Base HEX" />
      <PaletteRow colors={colors} />
    </div>
  );
}

export function GradientGenerator() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState("linear");
  const [angle, setAngle] = useState("90");
  const css = useMemo(() => {
    const a = parseHex(from);
    const b = parseHex(to);
    if (!a || !b) return null;
    const start = fromRgb(a).hex;
    const end = fromRgb(b).hex;
    if (kind === "radial") return `radial-gradient(circle, ${start}, ${end})`;
    const deg = Number(angle);
    const safe = Number.isFinite(deg) ? deg : 90;
    return `linear-gradient(${safe}deg, ${start}, ${end})`;
  }, [from, to, kind, angle]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <HexField value={from} onChange={setFrom} label="From HEX" placeholder="#14171C" />
        <HexField value={to} onChange={setTo} label="To HEX" placeholder="#E8A33D" />
        <Field label="Type">
          <Select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </Select>
        </Field>
        {kind === "linear" ? (
          <Field label="Angle">
            <Input value={angle} placeholder="90" onChange={(e) => setAngle(e.target.value)} />
          </Field>
        ) : null}
      </div>
      <Box>
        <div
          className="border-line h-16 rounded-[4px] border"
          style={{ background: css ?? "#14171C" }}
        />
        <Result label="CSS" value={css ?? "—"} steel />
      </Box>
    </div>
  );
}

export function CssGradientGenerator() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [kind, setKind] = useState("linear");
  const [angle, setAngle] = useState("90");
  const css = useMemo(() => {
    const a = parseHex(from);
    const b = parseHex(to);
    if (!a || !b) return null;
    const start = fromRgb(a).hex;
    const end = fromRgb(b).hex;
    const deg = Number(angle);
    const safe = Number.isFinite(deg) ? deg : 90;
    if (kind === "radial") return `radial-gradient(circle, ${start}, ${end})`;
    if (kind === "repeating") {
      return `repeating-linear-gradient(${safe}deg, ${start} 0%, ${end} 20%)`;
    }
    return `linear-gradient(${safe}deg, ${start}, ${end})`;
  }, [from, to, kind, angle]);
  const rule = css ? `background: ${css};` : null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <HexField value={from} onChange={setFrom} label="From HEX" placeholder="#14171C" />
        <HexField value={to} onChange={setTo} label="To HEX" placeholder="#E8A33D" />
        <Field label="Type">
          <Select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="repeating">Repeating linear</option>
          </Select>
        </Field>
        {kind !== "radial" ? (
          <Field label="Angle">
            <Input value={angle} placeholder="90" onChange={(e) => setAngle(e.target.value)} />
          </Field>
        ) : null}
      </div>
      <Box>
        <div
          className="border-line h-16 rounded-[4px] border"
          style={{ background: css ?? "#14171C" }}
        />
        <Result label="CSS" value={rule ?? "—"} steel />
      </Box>
    </div>
  );
}

export function ColorShadesGenerator() {
  return <HexPaletteTool compute={shades} />;
}

export function ColorTintGenerator() {
  return <HexPaletteTool compute={tints} />;
}

export function ColorToneGenerator() {
  return <HexPaletteTool compute={tones} />;
}

export function ComplementaryColorGenerator() {
  return <HexPaletteTool compute={complementary} />;
}

export function AnalogousColorGenerator() {
  return <HexPaletteTool compute={analogous} />;
}

export function TriadicColorGenerator() {
  return <HexPaletteTool compute={triadic} />;
}

export function SplitComplementaryGenerator() {
  return <HexPaletteTool compute={splitComplementary} />;
}

export function MonochromaticPaletteGenerator() {
  return <HexPaletteTool compute={monochromatic} />;
}

export function RandomColorGenerator() {
  const [color, setColor] = useState<ColorSet | null>(null);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <button
        type="button"
        onClick={() => setColor(fromRgb(randomRgb()))}
        className="bg-amber font-display text-bg w-fit rounded-[3px] px-6 py-[13px] text-[16px] font-semibold"
      >
        Generate
      </button>
      <ColorResults color={color} />
    </div>
  );
}

function ContrastFields({
  detailed,
}: {
  detailed: boolean;
}) {
  const [fg, setFg] = useState("");
  const [bg, setBg] = useState("");
  const result = useMemo(() => {
    const a = parseHex(fg);
    const b = parseHex(bg);
    if (!a || !b) return null;
    const ratio = contrastRatio(a, b);
    const rating = wcagRating(ratio);
    return { ratio, rating, fg: fromRgb(a).hex, bg: fromRgb(b).hex };
  }, [fg, bg]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <HexField value={fg} onChange={setFg} label="Text HEX" placeholder="#ECEEF1" />
        <HexField value={bg} onChange={setBg} label="Background HEX" placeholder="#14171C" />
      </div>
      <Box>
        <Result
          label="Contrast ratio"
          value={result ? `${result.ratio.toFixed(2)}:1` : "—"}
          steel
        />
        {detailed ? (
          <>
            <Result
              label="AA normal"
              value={result ? (result.rating.aaNormal ? "Pass" : "Fail") : "—"}
            />
            <Result
              label="AA large"
              value={result ? (result.rating.aaLarge ? "Pass" : "Fail") : "—"}
              steel
            />
            <Result
              label="AAA normal"
              value={result ? (result.rating.aaaNormal ? "Pass" : "Fail") : "—"}
            />
            <Result
              label="AAA large"
              value={result ? (result.rating.aaaLarge ? "Pass" : "Fail") : "—"}
              steel
            />
            <Result
              label="UI / graphics"
              value={result ? (result.rating.aaLarge ? "Pass" : "Fail") : "—"}
            />
          </>
        ) : (
          <>
            <Result
              label="WCAG AA"
              value={result ? (result.rating.aaNormal ? "Pass" : "Fail") : "—"}
            />
            <Result
              label="WCAG AAA"
              value={result ? (result.rating.aaaNormal ? "Pass" : "Fail") : "—"}
              steel
            />
          </>
        )}
        <div
          className="border-line rounded-[4px] border px-3 py-[11px] font-mono text-[16px]"
          style={{
            color: result?.fg ?? "#ECEEF1",
            background: result?.bg ?? "#14171C",
          }}
        >
          Sample text
        </div>
      </Box>
    </div>
  );
}

export function ColorContrastChecker() {
  return <ContrastFields detailed={false} />;
}

export function WcagContrastChecker() {
  return <ContrastFields detailed />;
}

export function ColorBlindnessSimulator() {
  const [hex, setHex] = useState("");
  const [kind, setKind] = useState<"protanopia" | "deuteranopia" | "tritanopia">(
    "protanopia",
  );
  const color = useMemo(() => {
    const parsed = parseHex(hex);
    if (!parsed) return null;
    return fromRgb(simulateBlindness(parsed, kind));
  }, [hex, kind]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <HexField value={hex} onChange={setHex} />
        <Field label="Simulation">
          <Select
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "protanopia" | "deuteranopia" | "tritanopia")
            }
          >
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
          </Select>
        </Field>
      </div>
      <ColorResults color={color} />
    </div>
  );
}

function ImageDrop({
  count,
  onColors,
}: {
  count: number;
  onColors: (colors: ColorSet[]) => void;
}) {
  const [error, setError] = useState("");
  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      onColors(await colorsFromImage(file, count));
    } catch {
      setError("Could not extract colors from this image.");
      onColors([]);
    }
  }
  return (
    <>
      <Field label="Image">
        <Input type="file" accept="image/*" onChange={(e) => void onFile(e.target.files?.[0])} />
      </Field>
      {error ? <div className="text-[13px] text-[#E17B6B]">{error}</div> : null}
    </>
  );
}

export function ImageColorPaletteExtractor() {
  const [colors, setColors] = useState<ColorSet[]>([]);
  return (
    <div className="grid gap-6">
      <ImageDrop count={6} onColors={setColors} />
      <PaletteRow colors={colors} />
    </div>
  );
}

export function DominantColorExtractor() {
  const [colors, setColors] = useState<ColorSet[]>([]);
  const dominant = colors[0] ?? null;
  return (
    <div className="grid gap-6">
      <ImageDrop count={3} onColors={setColors} />
      <ColorResults color={dominant} />
    </div>
  );
}

export function ColorNameFinder() {
  const [hex, setHex] = useState("");
  const result = useMemo(() => {
    const parsed = parseHex(hex);
    if (!parsed) return null;
    const color = fromRgb(parsed);
    return { color, name: nearestColorName(parsed) };
  }, [hex]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <HexField value={hex} onChange={setHex} />
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={result?.color.hex ?? "#14171C"} />
          <Result label="Closest name" value={result?.name ?? "—"} steel />
        </div>
        <Result label="HEX" value={result?.color.hex ?? "—"} />
      </Box>
    </div>
  );
}

export function ColorTemperatureTool() {
  const [hex, setHex] = useState("");
  const result = useMemo(() => {
    const parsed = parseHex(hex);
    if (!parsed) return null;
    return { color: fromRgb(parsed), temp: colorTemperature(parsed) };
  }, [hex]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <HexField value={hex} onChange={setHex} />
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={result?.color.hex ?? "#14171C"} />
          <Result label="Feel" value={result?.temp.label ?? "—"} steel />
        </div>
        <Result
          label="Color temperature"
          value={result ? `${result.temp.kelvin} K` : "—"}
        />
        <Result label="Hue" value={result ? `${result.temp.hue}°` : "—"} steel />
      </Box>
    </div>
  );
}

export function CssColorGenerator() {
  const [hex, setHex] = useState("#E8A33D");
  const color = useMemo(() => parseColor(hex), [hex]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Pick a color">
          <Input
            type="color"
            value={color?.hex ?? "#E8A33D"}
            onChange={(e) => setHex(e.target.value)}
          />
        </Field>
        <HexField value={hex} onChange={setHex} />
      </div>
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={color?.hex ?? "#14171C"} />
          <Result label="color" value={color ? `color: ${color.hex};` : "—"} steel />
        </div>
        <Result
          label="background-color"
          value={color ? `background-color: ${formatRgb(color.rgb)};` : "—"}
        />
        <Result
          label="CSS variable"
          value={color ? `--color: ${formatHsl(color.hsl)};` : "—"}
          steel
        />
      </Box>
    </div>
  );
}

export function TailwindColorConverter() {
  const [hex, setHex] = useState("");
  const result = useMemo(() => {
    const parsed = parseHex(hex);
    if (!parsed) return null;
    return { color: fromRgb(parsed), tw: nearestTailwind(parsed) };
  }, [hex]);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <HexField value={hex} onChange={setHex} />
      <Box>
        <div className="flex items-center gap-3">
          <Swatch hex={result?.tw.hex ?? "#14171C"} />
          <Result label="Tailwind token" value={result?.tw.token ?? "—"} steel />
        </div>
        <Result label="Class" value={result ? result.tw.className : "—"} />
        <Result label="Matched HEX" value={result?.tw.hex ?? "—"} steel />
      </Box>
    </div>
  );
}
