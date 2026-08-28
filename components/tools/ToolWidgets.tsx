"use client";

import { useMemo, useState } from "react";
import { Field, Input, Result, Select } from "@/components/ui/Form";
import { convertCurrency, useExchangeRates } from "@/lib/use-exchange-rates";
import {
  convertUnit,
  formatConverted,
  unitCategories,
  type UnitKind,
} from "@/lib/units";

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

type BmiUnit = "metric" | "imperial";
type BmiTone = "under" | "normal" | "over" | "obese";

const bmiFieldClass =
  "w-full rounded-[5px] border border-line bg-surface-2 px-[14px] py-3 font-mono text-[16px] text-text outline-none focus:border-amber";

const bmiTagClass: Record<BmiTone, string> = {
  under: "bg-[rgba(111,169,216,0.15)] text-steel",
  normal: "bg-[rgba(123,198,126,0.15)] text-[#7BC67E]",
  over: "bg-[rgba(232,163,61,0.15)] text-amber",
  obese: "bg-[rgba(225,123,107,0.15)] text-[#E17B6B]",
};

function computeBmi(
  unit: BmiUnit,
  heightCm: string,
  heightFt: string,
  heightIn: string,
  weight: string,
) {
  let bmi: number;
  if (unit === "metric") {
    const h = parseFloat(heightCm) / 100;
    const w = parseFloat(weight);
    if (!h || !w) return null;
    bmi = w / (h * h);
  } else {
    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(heightIn) || 0;
    const totalIn = ft * 12 + inch;
    const w = parseFloat(weight);
    if (!totalIn || !w) return null;
    bmi = (703 * w) / (totalIn * totalIn);
  }
  if (!Number.isFinite(bmi) || bmi <= 0) return null;

  const tone: BmiTone =
    bmi < 18.5 ? "under" : bmi < 25 ? "normal" : bmi < 30 ? "over" : "obese";
  const label =
    tone === "under"
      ? "Underweight"
      : tone === "normal"
        ? "Normal weight"
        : tone === "over"
          ? "Overweight"
          : "Obese";
  const pct = Math.max(0, Math.min(100, ((bmi - 15) / (40 - 15)) * 100));
  return { bmi, label, tone, pct };
}

export function BmiCalculator() {
  const [unit, setUnit] = useState<BmiUnit>("metric");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<ReturnType<typeof computeBmi>>(null);

  function calculate() {
    setResult(computeBmi(unit, heightCm, heightFt, heightIn, weight));
  }

  return (
    <div className="grid grid-cols-2 gap-10 max-[760px]:grid-cols-1">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          calculate();
        }}
      >
        <div className="mb-6 flex w-fit overflow-hidden rounded border border-line">
          <button
            type="button"
            className={`cursor-pointer border-0 px-4 py-2 font-mono text-[12.5px] ${
              unit === "metric"
                ? "bg-amber text-bg"
                : "bg-transparent text-text-dim"
            }`}
            onClick={() => setUnit("metric")}
          >
            Metric (cm/kg)
          </button>
          <button
            type="button"
            className={`cursor-pointer border-0 px-4 py-2 font-mono text-[12.5px] ${
              unit === "imperial"
                ? "bg-amber text-bg"
                : "bg-transparent text-text-dim"
            }`}
            onClick={() => setUnit("imperial")}
          >
            Imperial (ft/lb)
          </button>
        </div>

        {unit === "metric" ? (
          <label className="mb-5 block">
            <span className="mb-2 block font-mono text-[12px] tracking-[0.06em] text-text-dim uppercase">
              Height (cm)
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 170"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
              className={bmiFieldClass}
            />
          </label>
        ) : (
          <label className="mb-5 block">
            <span className="mb-2 block font-mono text-[12px] tracking-[0.06em] text-text-dim uppercase">
              Height (ft / in)
            </span>
            <div className="flex gap-[10px]">
              <input
                type="number"
                inputMode="decimal"
                placeholder="ft"
                value={heightFt}
                onChange={(event) => setHeightFt(event.target.value)}
                className={bmiFieldClass}
              />
              <input
                type="number"
                inputMode="decimal"
                placeholder="in"
                value={heightIn}
                onChange={(event) => setHeightIn(event.target.value)}
                className={bmiFieldClass}
              />
            </div>
          </label>
        )}

        <label className="mb-5 block">
          <span className="mb-2 block font-mono text-[12px] tracking-[0.06em] text-text-dim uppercase">
            {unit === "metric" ? "Weight (kg)" : "Weight (lb)"}
          </span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 65"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className={bmiFieldClass}
          />
        </label>

        <button
          type="submit"
          className="mt-2 w-full cursor-pointer rounded-[5px] border-0 bg-amber py-[14px] font-display text-[15px] font-bold text-bg hover:opacity-[0.92]"
        >
          Calculate BMI
        </button>
      </form>

      <div className="flex flex-col justify-center border-l border-line pl-10 max-[760px]:border-t max-[760px]:border-l-0 max-[760px]:pt-7 max-[760px]:pl-0">
        <div className="font-mono text-[12px] tracking-[0.08em] text-text-dim uppercase">
          Your BMI
        </div>
        <div className="mt-[14px] mb-[10px] font-mono text-[56px] leading-none text-amber">
          {result ? result.bmi.toFixed(1) : "—"}
        </div>
        {result ? (
          <span
            className={`inline-block w-fit rounded-[20px] px-[14px] py-1.5 font-display text-[14px] font-semibold ${bmiTagClass[result.tone]}`}
          >
            {result.label}
          </span>
        ) : null}
        <div
          className="relative mt-[26px] h-2 rounded"
          style={{
            background:
              "linear-gradient(90deg, #6FA9D8 0 25%, #7BC67E 25% 50%, #E8A33D 50% 70%, #E17B6B 70% 100%)",
          }}
        >
          {result ? (
            <div
              className="absolute top-[-6px] h-5 w-0.5 bg-white transition-[left] duration-300 ease-in-out"
              style={{ left: `${result.pct}%` }}
            />
          ) : null}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-text-dim">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>
    </div>
  );
}

export function PercentageCalculator() {
  const [value, setValue] = useState("");
  const [percent, setPercent] = useState("");

  const parsedValue = parseNumber(value);
  const parsedPercent = parseNumber(percent);
  const result =
    parsedValue == null || parsedPercent == null
      ? null
      : (parsedValue * parsedPercent) / 100;
  const increased =
    result == null || parsedValue == null ? null : parsedValue + result;
  const ofLabel =
    parsedPercent == null || parsedValue == null
      ? "Result"
      : `${parsedPercent}% of ${parsedValue}`;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Value">
          <Input
            type="number"
            inputMode="decimal"
            value={value}
            placeholder="0"
            onChange={(event) => setValue(event.target.value)}
          />
        </Field>
        <Field label="Percent">
          <Input
            type="number"
            inputMode="decimal"
            value={percent}
            placeholder="0"
            onChange={(event) => setPercent(event.target.value)}
          />
        </Field>
      </div>
      <div className="border-line bg-bg flex flex-col justify-center gap-6 rounded-[6px] border px-[26px] py-[22px]">
        <Result
          label={ofLabel}
          value={result == null ? "—" : result.toFixed(2)}
        />
        <Result
          label="After increase"
          value={increased == null ? "—" : increased.toFixed(2)}
          steel
        />
      </div>
    </div>
  );
}

export function LoanEmiCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const emi = useMemo(() => {
    const p = parseNumber(amount);
    const annual = parseNumber(rate);
    const tenure = parseNumber(years);
    if (
      p == null ||
      annual == null ||
      tenure == null ||
      p <= 0 ||
      tenure <= 0 ||
      annual < 0
    ) {
      return null;
    }
    const monthlyRate = annual / 12 / 100;
    const n = tenure * 12;
    if (monthlyRate === 0) return p / n;
    const pow = (1 + monthlyRate) ** n;
    const value = (p * monthlyRate * pow) / (pow - 1);
    return Number.isFinite(value) ? value : null;
  }, [amount, rate, years]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Loan amount">
          <Input
            type="number"
            inputMode="decimal"
            value={amount}
            placeholder="0"
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
        <Field label="Interest % / year">
          <Input
            type="number"
            inputMode="decimal"
            value={rate}
            placeholder="0"
            onChange={(event) => setRate(event.target.value)}
          />
        </Field>
        <Field label="Tenure (years)">
          <Input
            type="number"
            inputMode="decimal"
            value={years}
            placeholder="0"
            onChange={(event) => setYears(event.target.value)}
          />
        </Field>
      </div>
      <div className="border-line bg-bg flex flex-col justify-center gap-6 rounded-[6px] border px-[26px] py-[22px]">
        <Result
          label="Loan EMI"
          value={emi == null ? "—" : `$${Math.round(emi).toLocaleString()}`}
          hint="/mo"
          steel
        />
        <Result
          label="Total payable"
          value={
            emi == null
              ? "—"
              : `$${Math.round(emi * Number(years) * 12).toLocaleString()}`
          }
        />
      </div>
    </div>
  );
}

export function WordCounter() {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const minutes = words === 0 ? 0 : words / 200;

  return (
    <div className="grid gap-6">
      <textarea
        value={text}
        placeholder="Paste text to count words, characters, and reading time."
        onChange={(event) => setText(event.target.value)}
        rows={8}
        className="border-line bg-bg text-text w-full rounded-[3px] border px-3 py-[11px] text-[16px] leading-[1.6] outline-none focus:border-amber"
      />
      <div className="flex flex-wrap gap-10">
        <Result label="Words" value={text ? String(words) : "—"} />
        <Result label="Characters" value={text ? String(chars) : "—"} steel />
        <Result
          label="Reading time"
          value={words === 0 ? "—" : `${Math.max(1, Math.ceil(minutes))}m`}
        />
      </div>
    </div>
  );
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const { rates } = useExchangeRates();
  const codes = rates ? Object.keys(rates).sort() : ["USD", "EUR"];

  const parsedAmount = parseNumber(amount);
  const converted =
    rates && parsedAmount != null
      ? convertCurrency(rates, parsedAmount, from, to)
      : null;
  const rate =
    rates && rates[from] && rates[to] ? rates[to] / rates[from] : null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Amount">
          <Input
            type="number"
            inputMode="decimal"
            value={amount}
            placeholder="0"
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
        <Field label="From">
          <Select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          >
            {codes.map((code) => (
              <option key={code}>{code}</option>
            ))}
          </Select>
        </Field>
        <Field label="To">
          <Select value={to} onChange={(event) => setTo(event.target.value)}>
            {codes.map((code) => (
              <option key={code}>{code}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="border-line bg-bg flex flex-col justify-center gap-6 rounded-[6px] border px-[26px] py-[22px]">
        <Result
          label={`${from} → ${to}`}
          value={converted == null ? "—" : converted.toFixed(2)}
          steel
        />
        <Result label="Rate" value={rate == null ? "—" : rate.toFixed(4)} />
      </div>
    </div>
  );
}

function diffAge(birth: Date, now: Date) {
  if (now.getTime() < birth.getTime()) return null;

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days = now.getDate() + (prevMonthDays - Math.min(birth.getDate(), prevMonthDays));
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0 || days < 0) return null;
  return { years, months, days };
}

export function AgeCalculator() {
  const [date, setDate] = useState("");

  const age = useMemo(() => {
    if (!date) return null;
    const birth = new Date(`${date}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return null;
    return diffAge(birth, new Date());
  }, [date]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Field label="Date of birth">
        <Input
          type="date"
          value={date}
          max={localISODate(new Date())}
          onChange={(event) => setDate(event.target.value)}
        />
      </Field>
      <div className="border-line bg-bg flex flex-col justify-center gap-6 rounded-[6px] border px-[26px] py-[22px]">
        <Result
          label="Age"
          value={age ? `${age.years}y ${age.months}m` : "—"}
        />
        <Result
          label="Days this month"
          value={age ? `${age.days}d` : "—"}
          steel
        />
      </div>
    </div>
  );
}

export function QrCodeGenerator() {
  const [text, setText] = useState("");
  const src = text.trim()
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text.trim())}`
    : "";

  return (
    <div className="grid items-start gap-8 md:grid-cols-2">
      <Field label="Link or text">
        <Input
          value={text}
          placeholder="Enter a link or text"
          onChange={(event) => setText(event.target.value)}
        />
      </Field>
      <div className="border-line bg-bg flex h-[228px] items-center justify-center rounded-[6px] border p-6">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="Generated QR code" width={180} height={180} />
        ) : (
          <span className="text-text-dim font-mono text-[12.5px]">
            Waiting for input
          </span>
        )}
      </div>
    </div>
  );
}

const unitDefaults: Record<UnitKind, [string, string]> = {
  length: ["m", "ft"],
  weight: ["kg", "lb"],
  volume: ["l", "gal"],
  temperature: ["C", "F"],
  area: ["m2", "ft2"],
  speed: ["kph", "mph"],
  time: ["h", "min"],
  data: ["MB", "GB"],
  pressure: ["psi", "bar"],
  energy: ["kcal", "kJ"],
  power: ["hp", "kW"],
  angle: ["deg", "rad"],
};

export function UnitConverter() {
  const [kind, setKind] = useState<UnitKind>("length");
  const [from, setFrom] = useState(unitDefaults.length[0]);
  const [to, setTo] = useState(unitDefaults.length[1]);
  const [amount, setAmount] = useState("");
  const options = unitCategories[kind].units;

  const converted = useMemo(() => {
    const value = parseNumber(amount);
    if (value == null) return null;
    return convertUnit(kind, from, to, value);
  }, [amount, from, to, kind]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Type">
          <Select
            value={kind}
            onChange={(event) => {
              const next = event.target.value as UnitKind;
              setKind(next);
              setFrom(unitDefaults[next][0]);
              setTo(unitDefaults[next][1]);
            }}
          >
            {(Object.keys(unitCategories) as UnitKind[]).map((key) => (
              <option key={key} value={key}>
                {unitCategories[key].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Amount (${from})`}>
          <Input
            type="number"
            inputMode="decimal"
            value={amount}
            placeholder="0"
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From">
            <Select
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            >
              {options.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="To">
            <Select value={to} onChange={(event) => setTo(event.target.value)}>
              {options.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
      <div className="border-line bg-bg flex flex-col justify-center gap-6 rounded-[6px] border px-[26px] py-[22px]">
        <Result
          label={`${from} → ${to}`}
          value={converted == null ? "—" : formatConverted(converted)}
          steel
        />
      </div>
    </div>
  );
}
