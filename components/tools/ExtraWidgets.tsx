"use client";

import { useMemo, useState } from "react";
import { Field, Input, Result, Select, Textarea } from "@/components/ui/Form";

function parseNumber(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function localISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-line bg-bg flex flex-col justify-center gap-6 rounded-[6px] border px-[26px] py-[22px]">
      {children}
    </div>
  );
}

function mifflin(weight: number, height: number, age: number, male: boolean) {
  return male
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
}

export function CalorieCalculator() {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState("male");
  const [activity, setActivity] = useState("1.55");

  const calories = useMemo(() => {
    const a = parseNumber(age);
    const h = parseNumber(height);
    const w = parseNumber(weight);
    const factor = Number(activity);
    if (a == null || h == null || w == null || a <= 0 || h <= 0 || w <= 0) {
      return null;
    }
    return mifflin(w, h, a, sex === "male") * factor;
  }, [age, height, weight, sex, activity]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Age">
          <Input type="number" value={age} placeholder="0" onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label="Height (cm)">
          <Input type="number" value={height} placeholder="0" onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" value={weight} placeholder="0" onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <Field label="Sex">
          <Select value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </Field>
        <Field label="Activity">
          <Select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="1.2">Sedentary</option>
            <option value="1.375">Light</option>
            <option value="1.55">Moderate</option>
            <option value="1.725">Active</option>
            <option value="1.9">Very active</option>
          </Select>
        </Field>
      </div>
      <Box>
        <Result label="Daily calories" value={calories == null ? "—" : `${Math.round(calories)} kcal`} />
        <Result label="To maintain weight" value={calories == null ? "—" : "TDEE"} steel />
      </Box>
    </div>
  );
}

export function BmrCalculator() {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState("male");
  const bmr = useMemo(() => {
    const a = parseNumber(age);
    const h = parseNumber(height);
    const w = parseNumber(weight);
    if (a == null || h == null || w == null || a <= 0 || h <= 0 || w <= 0) return null;
    return mifflin(w, h, a, sex === "male");
  }, [age, height, weight, sex]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Age">
          <Input type="number" value={age} placeholder="0" onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label="Height (cm)">
          <Input type="number" value={height} placeholder="0" onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" value={weight} placeholder="0" onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <Field label="Sex">
          <Select value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </Field>
      </div>
      <Box>
        <Result label="BMR" value={bmr == null ? "—" : `${Math.round(bmr)} kcal`} />
        <Result label="Formula" value={bmr == null ? "—" : "Mifflin-St Jeor"} steel />
      </Box>
    </div>
  );
}

export function BodyFatCalculator() {
  const [bmi, setBmi] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const fat = useMemo(() => {
    const b = parseNumber(bmi);
    const a = parseNumber(age);
    if (b == null || a == null || b <= 0 || a <= 0) return null;
    const sexN = sex === "male" ? 1 : 0;
    const value = 1.2 * b + 0.23 * a - 10.8 * sexN - 5.4;
    return Number.isFinite(value) && value >= 0 ? value : null;
  }, [bmi, age, sex]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="BMI">
          <Input type="number" value={bmi} placeholder="0" onChange={(e) => setBmi(e.target.value)} />
        </Field>
        <Field label="Age">
          <Input type="number" value={age} placeholder="0" onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label="Sex">
          <Select value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </Field>
      </div>
      <Box>
        <Result label="Body fat" value={fat == null ? "—" : `${fat.toFixed(1)}%`} />
        <Result label="Method" value={fat == null ? "—" : "Deurenberg"} steel />
      </Box>
    </div>
  );
}

export function PregnancyDueDateCalculator() {
  const [lmp, setLmp] = useState("");
  const due = useMemo(() => {
    if (!lmp) return null;
    const start = new Date(`${lmp}T00:00:00`);
    if (Number.isNaN(start.getTime())) return null;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (start.getTime() > today.getTime()) return null;
    start.setDate(start.getDate() + 280);
    return localISODate(start);
  }, [lmp]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="Last period (first day)">
        <Input type="date" value={lmp} max={localISODate(new Date())} onChange={(e) => setLmp(e.target.value)} />
      </Field>
      <Box>
        <Result label="Due date" value={due ?? "—"} />
        <Result label="Method" value={due == null ? "—" : "Naegele 280d"} steel />
      </Box>
    </div>
  );
}

export function OvulationCalculator() {
  const [lmp, setLmp] = useState("");
  const [cycle, setCycle] = useState("");
  const result = useMemo(() => {
    if (!lmp) return null;
    const length = parseNumber(cycle);
    if (length == null || length < 20 || length > 45) return null;
    const start = new Date(`${lmp}T00:00:00`);
    if (Number.isNaN(start.getTime())) return null;
    const ovulation = new Date(start);
    ovulation.setDate(start.getDate() + length - 14);
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    return {
      ovulation: localISODate(ovulation),
      window: `${localISODate(fertileStart)} → ${localISODate(ovulation)}`,
    };
  }, [lmp, cycle]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Last period (first day)">
          <Input type="date" value={lmp} max={localISODate(new Date())} onChange={(e) => setLmp(e.target.value)} />
        </Field>
        <Field label="Cycle length (days)">
          <Input type="number" value={cycle} placeholder="0" onChange={(e) => setCycle(e.target.value)} />
        </Field>
      </div>
      <Box>
        <Result label="Ovulation" value={result?.ovulation ?? "—"} />
        <Result label="Fertile window" value={result?.window ?? "—"} steel />
      </Box>
    </div>
  );
}

export function WaterIntakeCalculator() {
  const [weight, setWeight] = useState("");
  const liters = useMemo(() => {
    const w = parseNumber(weight);
    if (w == null || w <= 0) return null;
    return (w * 35) / 1000;
  }, [weight]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="Weight (kg)">
        <Input type="number" value={weight} placeholder="0" onChange={(e) => setWeight(e.target.value)} />
      </Field>
      <Box>
        <Result label="Daily water" value={liters == null ? "—" : `${liters.toFixed(1)} L`} />
        <Result label="Rule" value={liters == null ? "—" : "35 ml / kg"} steel />
      </Box>
    </div>
  );
}

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [n, setN] = useState("12");
  const future = useMemo(() => {
    const p = parseNumber(principal);
    const r = parseNumber(rate);
    const t = parseNumber(years);
    const times = parseNumber(n);
    if (p == null || r == null || t == null || times == null || p < 0 || t < 0 || times <= 0) {
      return null;
    }
    const value = p * (1 + r / 100 / times) ** (times * t);
    return Number.isFinite(value) ? value : null;
  }, [principal, rate, years, n]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Principal">
          <Input type="number" value={principal} placeholder="0" onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="Annual rate %">
          <Input type="number" value={rate} placeholder="0" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Years">
          <Input type="number" value={years} placeholder="0" onChange={(e) => setYears(e.target.value)} />
        </Field>
        <Field label="Compounds / year">
          <Select value={n} onChange={(e) => setN(e.target.value)}>
            <option value="1">Annually</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </Select>
        </Field>
      </div>
      <Box>
        <Result label="Future value" value={future == null ? "—" : `$${future.toFixed(2)}`} steel />
        <Result
          label="Interest earned"
          value={
            future == null || parseNumber(principal) == null
              ? "—"
              : `$${(future - Number(principal)).toFixed(2)}`
          }
        />
      </Box>
    </div>
  );
}

export function GstCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const parsed = parseNumber(amount);
  const pct = parseNumber(rate);
  const tax = parsed == null || pct == null || parsed < 0 || pct < 0 ? null : (parsed * pct) / 100;
  const total = tax == null || parsed == null ? null : parsed + tax;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Net amount">
          <Input type="number" value={amount} placeholder="0" onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="GST / VAT %">
          <Input type="number" value={rate} placeholder="0" onChange={(e) => setRate(e.target.value)} />
        </Field>
      </div>
      <Box>
        <Result label="Tax" value={tax == null ? "—" : tax.toFixed(2)} />
        <Result label="Gross" value={total == null ? "—" : total.toFixed(2)} steel />
      </Box>
    </div>
  );
}

export function TipCalculator() {
  const [bill, setBill] = useState("");
  const [tip, setTip] = useState("");
  const [people, setPeople] = useState("");
  const parsedBill = parseNumber(bill);
  const parsedTip = parseNumber(tip);
  const parsedPeople = parseNumber(people);
  const tipAmt =
    parsedBill == null || parsedTip == null || parsedBill < 0 || parsedTip < 0
      ? null
      : (parsedBill * parsedTip) / 100;
  const each =
    tipAmt == null || parsedBill == null || parsedPeople == null || parsedPeople < 1
      ? null
      : (parsedBill + tipAmt) / parsedPeople;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Bill">
          <Input type="number" value={bill} placeholder="0" onChange={(e) => setBill(e.target.value)} />
        </Field>
        <Field label="Tip %">
          <Input type="number" value={tip} placeholder="0" onChange={(e) => setTip(e.target.value)} />
        </Field>
        <Field label="People">
          <Input type="number" value={people} placeholder="0" onChange={(e) => setPeople(e.target.value)} />
        </Field>
      </div>
      <Box>
        <Result label="Tip" value={tipAmt == null ? "—" : `$${tipAmt.toFixed(2)}`} />
        <Result label="Per person" value={each == null ? "—" : `$${each.toFixed(2)}`} steel />
      </Box>
    </div>
  );
}

export function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [off, setOff] = useState("");
  const p = parseNumber(price);
  const d = parseNumber(off);
  const saved = p == null || d == null || p < 0 || d < 0 ? null : (p * d) / 100;
  const final = saved == null || p == null ? null : p - saved;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Original price">
          <Input type="number" value={price} placeholder="0" onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Discount %">
          <Input type="number" value={off} placeholder="0" onChange={(e) => setOff(e.target.value)} />
        </Field>
      </div>
      <Box>
        <Result label="You save" value={saved == null ? "—" : saved.toFixed(2)} />
        <Result label="Sale price" value={final == null ? "—" : final.toFixed(2)} steel />
      </Box>
    </div>
  );
}

export function SipCalculator() {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const future = useMemo(() => {
    const pmt = parseNumber(monthly);
    const r = parseNumber(rate);
    const t = parseNumber(years);
    if (pmt == null || r == null || t == null || pmt < 0 || t <= 0) return null;
    const i = r / 100 / 12;
    const n = t * 12;
    if (i === 0) return pmt * n;
    const value = pmt * (((1 + i) ** n - 1) / i) * (1 + i);
    return Number.isFinite(value) ? value : null;
  }, [monthly, rate, years]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Monthly amount">
          <Input type="number" value={monthly} placeholder="0" onChange={(e) => setMonthly(e.target.value)} />
        </Field>
        <Field label="Annual return %">
          <Input type="number" value={rate} placeholder="0" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Years">
          <Input type="number" value={years} placeholder="0" onChange={(e) => setYears(e.target.value)} />
        </Field>
      </div>
      <Box>
        <Result label="Maturity" value={future == null ? "—" : `$${future.toFixed(0)}`} steel />
        <Result
          label="Invested"
          value={
            parseNumber(monthly) == null || parseNumber(years) == null
              ? "—"
              : `$${(Number(monthly) * Number(years) * 12).toFixed(0)}`
          }
        />
      </Box>
    </div>
  );
}

export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const p = parseNumber(principal);
  const r = parseNumber(rate);
  const t = parseNumber(years);
  const interest =
    p == null || r == null || t == null || p < 0 || t < 0 ? null : (p * r * t) / 100;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Principal">
          <Input type="number" value={principal} placeholder="0" onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="Rate % / year">
          <Input type="number" value={rate} placeholder="0" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Years">
          <Input type="number" value={years} placeholder="0" onChange={(e) => setYears(e.target.value)} />
        </Field>
      </div>
      <Box>
        <Result label="Interest" value={interest == null ? "—" : interest.toFixed(2)} />
        <Result
          label="Total"
          value={interest == null || p == null ? "—" : (p + interest).toFixed(2)}
          steel
        />
      </Box>
    </div>
  );
}

export function CaseConverter() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("upper");
  const out = useMemo(() => {
    if (!text) return "";
    if (mode === "upper") return text.toUpperCase();
    if (mode === "lower") return text.toLowerCase();
    if (mode === "title") {
      return text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }, [text, mode]);

  return (
    <div className="grid gap-6">
      <Textarea rows={5} value={text} placeholder="Paste text" onChange={(e) => setText(e.target.value)} />
      <Field label="Case">
        <Select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="upper">UPPER CASE</option>
          <option value="lower">lower case</option>
          <option value="title">Title Case</option>
          <option value="sentence">Sentence case</option>
        </Select>
      </Field>
      <Box>
        <div className="text-text whitespace-pre-wrap break-words font-mono text-[15px]">{out || "—"}</div>
      </Box>
    </div>
  );
}

export function PasswordGenerator() {
  const [length, setLength] = useState("");
  const [password, setPassword] = useState("");

  function generate() {
    const parsed = parseNumber(length);
    if (parsed == null || parsed < 1) return;
    const len = Math.min(64, Math.max(8, parsed));
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    const bytes = new Uint32Array(len);
    crypto.getRandomValues(bytes);
    setPassword(Array.from(bytes, (n) => chars[n % chars.length]).join(""));
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Length">
          <Input type="number" value={length} placeholder="0" onChange={(e) => setLength(e.target.value)} />
        </Field>
        <button
          type="button"
          onClick={generate}
          className="bg-amber font-display text-bg w-fit rounded-[3px] px-6 py-[13px] text-[16px] font-semibold"
        >
          Generate
        </button>
      </div>
      <Box>
        <Result label="Password" value={password || "—"} steel />
      </Box>
    </div>
  );
}

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ";

export function LoremIpsumGenerator() {
  const [count, setCount] = useState("");
  const n = parseNumber(count);
  const text =
    n == null || n < 1
      ? ""
      : Array.from({ length: Math.min(12, n) }, () => LOREM.trim()).join("\n\n");

  return (
    <div className="grid gap-6">
      <Field label="Paragraphs">
        <Input type="number" value={count} placeholder="0" onChange={(e) => setCount(e.target.value)} />
      </Field>
      <Textarea rows={8} readOnly value={text} />
    </div>
  );
}

export function TextReverser() {
  const [text, setText] = useState("");
  return (
    <div className="grid gap-6">
      <Textarea rows={5} value={text} placeholder="Paste text" onChange={(e) => setText(e.target.value)} />
      <Box>
        <div className="text-text break-words font-mono text-[15px]">
          {text ? [...text].reverse().join("") : "—"}
        </div>
      </Box>
    </div>
  );
}

export function Base64Encoder() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("encode");
  const out = useMemo(() => {
    if (!text) return "";
    try {
      if (mode === "encode") {
        const bytes = new TextEncoder().encode(text);
        let binary = "";
        bytes.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });
        return btoa(binary);
      }
      const binary = atob(text);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return "Invalid Base64";
    }
  }, [text, mode]);

  return (
    <div className="grid gap-6">
      <Field label="Mode">
        <Select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="encode">Encode</option>
          <option value="decode">Decode</option>
        </Select>
      </Field>
      <Textarea rows={5} value={text} placeholder="Text" onChange={(e) => setText(e.target.value)} />
      <Box>
        <div className="text-text break-all font-mono text-[15px]">{out || "—"}</div>
      </Box>
    </div>
  );
}

export function SlugGenerator() {
  const [text, setText] = useState("");
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="Title">
        <Input value={text} placeholder="My blog post" onChange={(e) => setText(e.target.value)} />
      </Field>
      <Box>
        <Result label="Slug" value={slug || "—"} steel />
      </Box>
    </div>
  );
}

export function TemperatureConverterWidget() {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("C");
  const [to, setTo] = useState("F");
  const value = parseNumber(amount);
  const converted = useMemo(() => {
    if (value == null) return null;
    let k = value;
    if (from === "C") k = value + 273.15;
    else if (from === "F") k = ((value + 459.67) * 5) / 9;
    else if (from === "K") k = value;
    if (!Number.isFinite(k) || k < 0) return null;
    if (from === to) return value;
    if (to === "C") return k - 273.15;
    if (to === "F") return (k * 9) / 5 - 459.67;
    return k;
  }, [value, from, to]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Amount">
          <Input type="number" value={amount} placeholder="0" onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From">
            <Select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option>C</option>
              <option>F</option>
              <option>K</option>
            </Select>
          </Field>
          <Field label="To">
            <Select value={to} onChange={(e) => setTo(e.target.value)}>
              <option>C</option>
              <option>F</option>
              <option>K</option>
            </Select>
          </Field>
        </div>
      </div>
      <Box>
        <Result label={`${from} → ${to}`} value={converted == null ? "—" : converted.toFixed(2)} steel />
      </Box>
    </div>
  );
}

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function chunkToWords(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
  return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? " " + chunkToWords(n % 100) : ""}`;
}

function numberToWords(n: number): string {
  if (n === 0) return "zero";
  if (n < 0) return `minus ${numberToWords(-n)}`;
  if (!Number.isFinite(n) || Math.abs(n) >= 1e18) return "too large";
  const scales = ["", "thousand", "million", "billion", "trillion", "quadrillion"];
  const parts = [];
  let scale = 0;
  let x = Math.trunc(n);
  while (x > 0 && scale < scales.length) {
    const chunk = x % 1000;
    if (chunk) parts.unshift(`${chunkToWords(chunk)}${scales[scale] ? " " + scales[scale] : ""}`);
    x = Math.floor(x / 1000);
    scale += 1;
  }
  if (x > 0) return "too large";
  return parts.join(" ");
}

export function NumberToWords() {
  const [value, setValue] = useState("");
  const n = parseNumber(value);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="Number">
        <Input type="number" value={value} placeholder="0" onChange={(e) => setValue(e.target.value)} />
      </Field>
      <Box>
        <Result label="In words" value={n == null ? "—" : numberToWords(n)} steel />
      </Box>
    </div>
  );
}

export function BinaryConverter() {
  const [value, setValue] = useState("");
  const [from, setFrom] = useState("dec");
  const dec = useMemo(() => {
    const raw = value.trim();
    if (!raw) return null;
    if (from === "bin") {
      if (!/^[01]+$/.test(raw)) return null;
      const parsed = Number.parseInt(raw, 2);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (from === "hex") {
      if (!/^[0-9a-fA-F]+$/.test(raw)) return null;
      const parsed = Number.parseInt(raw, 16);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (!/^-?\d+$/.test(raw)) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }, [value, from]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Value">
          <Input value={value} placeholder="0" onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="From">
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="dec">Decimal</option>
            <option value="bin">Binary</option>
            <option value="hex">Hex</option>
          </Select>
        </Field>
      </div>
      <Box>
        <Result label="Decimal" value={dec == null ? "—" : String(dec)} />
        <Result label="Binary" value={dec == null ? "—" : dec.toString(2)} steel />
        <Result label="Hex" value={dec == null ? "—" : dec.toString(16).toUpperCase()} />
      </Box>
    </div>
  );
}

export function ColorConverter() {
  const [hex, setHex] = useState("");
  const rgb = useMemo(() => {
    let clean = hex.replace("#", "").trim();
    if (/^[0-9a-fA-F]{3}$/.test(clean)) {
      clean = clean
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    const n = Number.parseInt(clean, 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  }, [hex]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="HEX">
        <Input value={hex} placeholder="#E8A33D" onChange={(e) => setHex(e.target.value)} />
      </Field>
      <Box>
        <Result label="RGB" value={rgb ?? "—"} steel />
      </Box>
    </div>
  );
}

const ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n: number) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  let left = n;
  let out = "";
  for (const [value, glyph] of ROMAN) {
    while (left >= value) {
      out += glyph;
      left -= value;
    }
  }
  return out;
}

export function RomanNumeralConverter() {
  const [value, setValue] = useState("");
  const n = parseNumber(value);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="Number (1–3999)">
        <Input type="number" value={value} placeholder="0" onChange={(e) => setValue(e.target.value)} />
      </Field>
      <Box>
        <Result label="Roman" value={n == null ? "—" : toRoman(n) ?? "—"} steel />
      </Box>
    </div>
  );
}

export function TimeCalculatorWidget() {
  const [h, setH] = useState("");
  const [m, setM] = useState("");
  const [s, setS] = useState("");
  const hours = parseNumber(h);
  const mins = parseNumber(m);
  const secs = parseNumber(s);
  const empty = !h && !m && !s;
  const invalid =
    empty ||
    (hours == null && h !== "") ||
    (mins == null && m !== "") ||
    (secs == null && s !== "") ||
    (hours ?? 0) < 0 ||
    (mins ?? 0) < 0 ||
    (secs ?? 0) < 0;
  const total = (hours ?? 0) * 3600 + (mins ?? 0) * 60 + (secs ?? 0);
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Hours">
          <Input type="number" value={h} placeholder="0" onChange={(e) => setH(e.target.value)} />
        </Field>
        <Field label="Minutes">
          <Input type="number" value={m} placeholder="0" onChange={(e) => setM(e.target.value)} />
        </Field>
        <Field label="Seconds">
          <Input type="number" value={s} placeholder="0" onChange={(e) => setS(e.target.value)} />
        </Field>
      </div>
      <Box>
        <Result label="Total seconds" value={invalid ? "—" : String(total)} />
        <Result
          label="Normalized"
          value={invalid ? "—" : `${hh}h ${mm}m ${ss}s`}
          steel
        />
      </Box>
    </div>
  );
}

function parseLocalDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateGap(start: Date, end: Date) {
  const later = end.getTime() >= start.getTime() ? end : start;
  const earlier = end.getTime() >= start.getTime() ? start : end;
  let years = later.getFullYear() - earlier.getFullYear();
  let months = later.getMonth() - earlier.getMonth();
  let days = later.getDate() - earlier.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(later.getFullYear(), later.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.round((later.getTime() - earlier.getTime()) / 86400000);
  const weeks = Math.floor(totalDays / 7);
  const weekDays = totalDays % 7;
  return { years, months, days, totalDays, weeks, weekDays, hours: totalDays * 24 };
}

export function DateDifferenceCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const gap = useMemo(() => {
    const from = parseLocalDate(start);
    const to = parseLocalDate(end);
    if (!from || !to) return null;
    return dateGap(from, to);
  }, [start, end]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Start date">
          <Input type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </Field>
        <Field label="End date">
          <Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </Field>
      </div>
      <Box>
        <Result
          label="Duration"
          value={gap ? `${gap.years}y ${gap.months}m ${gap.days}d` : "—"}
        />
        <Result
          label="Total days"
          value={gap ? String(gap.totalDays) : "—"}
          steel
        />
        <Result
          label="Weeks"
          value={gap ? `${gap.weeks}w ${gap.weekDays}d` : "—"}
        />
        <Result
          label="Hours"
          value={gap ? String(gap.hours) : "—"}
          steel
        />
      </Box>
    </div>
  );
}
