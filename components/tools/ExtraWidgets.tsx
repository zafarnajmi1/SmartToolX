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

type BmrHeightUnit = "cm" | "m" | "ftin" | "in";
type BmrWeightUnit = "kg" | "lb" | "stlb" | "st";

const BMR_INCH_M = 0.0254;
const BMR_LB_KG = 0.45359237;
const BMR_STONE_LB = 14;

function bmrAmount(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function bmrTrim(value: number, digits: number) {
  const rounded = Number(value.toFixed(digits));
  if (!Number.isFinite(rounded) || rounded < 0) return "";
  return String(rounded);
}

function bmrHeightToCm(unit: BmrHeightUnit, primary: string, extra: string) {
  if (unit === "cm") {
    const cm = bmrAmount(primary);
    return cm && cm > 0 ? cm : null;
  }
  if (unit === "m") {
    const meters = bmrAmount(primary);
    return meters && meters > 0 ? meters * 100 : null;
  }
  if (unit === "in") {
    const inches = bmrAmount(primary);
    return inches && inches > 0 ? inches * BMR_INCH_M * 100 : null;
  }
  const feet = bmrAmount(primary) ?? 0;
  const inches = bmrAmount(extra) ?? 0;
  const totalInches = feet * 12 + inches;
  return totalInches > 0 ? totalInches * BMR_INCH_M * 100 : null;
}

function bmrWeightToKg(unit: BmrWeightUnit, primary: string, extra: string) {
  if (unit === "kg") {
    const kg = bmrAmount(primary);
    return kg && kg > 0 ? kg : null;
  }
  if (unit === "lb") {
    const pounds = bmrAmount(primary);
    return pounds && pounds > 0 ? pounds * BMR_LB_KG : null;
  }
  if (unit === "st") {
    const stone = bmrAmount(primary);
    return stone && stone > 0 ? stone * BMR_STONE_LB * BMR_LB_KG : null;
  }
  const stone = bmrAmount(primary) ?? 0;
  const pounds = bmrAmount(extra) ?? 0;
  const totalPounds = stone * BMR_STONE_LB + pounds;
  return totalPounds > 0 ? totalPounds * BMR_LB_KG : null;
}

function bmrCmToHeight(unit: BmrHeightUnit, cm: number) {
  if (unit === "cm") return { primary: bmrTrim(cm, 1), extra: "" };
  if (unit === "m") return { primary: bmrTrim(cm / 100, 2), extra: "" };
  const totalInches = cm / (BMR_INCH_M * 100);
  if (unit === "in") return { primary: bmrTrim(totalInches, 1), extra: "" };
  const feet = Math.floor(totalInches / 12 + 1e-9);
  const inches = Math.max(0, totalInches - feet * 12);
  return { primary: String(feet), extra: bmrTrim(inches, 1) };
}

function bmrKgToWeight(unit: BmrWeightUnit, kg: number) {
  if (unit === "kg") return { primary: bmrTrim(kg, 1), extra: "" };
  const totalPounds = kg / BMR_LB_KG;
  if (unit === "lb") return { primary: bmrTrim(totalPounds, 1), extra: "" };
  if (unit === "st") {
    return { primary: bmrTrim(totalPounds / BMR_STONE_LB, 2), extra: "" };
  }
  const stone = Math.floor(totalPounds / BMR_STONE_LB + 1e-9);
  const pounds = Math.max(0, totalPounds - stone * BMR_STONE_LB);
  return { primary: String(stone), extra: bmrTrim(pounds, 1) };
}

export function CalorieCalculator() {
  const [age, setAge] = useState("");
  const [heightUnit, setHeightUnit] = useState<BmrHeightUnit>("cm");
  const [heightPrimary, setHeightPrimary] = useState("");
  const [heightExtra, setHeightExtra] = useState("");
  const [weightUnit, setWeightUnit] = useState<BmrWeightUnit>("kg");
  const [weightPrimary, setWeightPrimary] = useState("");
  const [weightExtra, setWeightExtra] = useState("");
  const [sex, setSex] = useState("male");
  const [activity, setActivity] = useState("1.55");

  function changeHeightUnit(next: BmrHeightUnit) {
    const cm = bmrHeightToCm(heightUnit, heightPrimary, heightExtra);
    if (cm != null) {
      const converted = bmrCmToHeight(next, cm);
      setHeightPrimary(converted.primary);
      setHeightExtra(converted.extra);
    } else {
      setHeightExtra("");
    }
    setHeightUnit(next);
  }

  function changeWeightUnit(next: BmrWeightUnit) {
    const kg = bmrWeightToKg(weightUnit, weightPrimary, weightExtra);
    if (kg != null) {
      const converted = bmrKgToWeight(next, kg);
      setWeightPrimary(converted.primary);
      setWeightExtra(converted.extra);
    } else {
      setWeightExtra("");
    }
    setWeightUnit(next);
  }

  const calories = useMemo(() => {
    const a = parseNumber(age);
    const h = bmrHeightToCm(heightUnit, heightPrimary, heightExtra);
    const w = bmrWeightToKg(weightUnit, weightPrimary, weightExtra);
    const factor = Number(activity);
    if (a == null || h == null || w == null || a <= 0) return null;
    return mifflin(w, h, a, sex === "male") * factor;
  }, [
    age,
    heightUnit,
    heightPrimary,
    heightExtra,
    weightUnit,
    weightPrimary,
    weightExtra,
    sex,
    activity,
  ]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Age (years)">
          <Input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={age}
            placeholder="30"
            onChange={(e) => setAge(e.target.value)}
          />
        </Field>
        <Field label="Height unit">
          <Select
            value={heightUnit}
            onChange={(e) => changeHeightUnit(e.target.value as BmrHeightUnit)}
          >
            <option value="cm">Centimeters (cm)</option>
            <option value="m">Meters (m)</option>
            <option value="ftin">Feet and inches</option>
            <option value="in">Inches (in)</option>
          </Select>
        </Field>
        {heightUnit === "ftin" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Feet">
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={heightPrimary}
                placeholder="5"
                onChange={(e) => setHeightPrimary(e.target.value)}
              />
            </Field>
            <Field label="Inches">
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={heightExtra}
                placeholder="10"
                onChange={(e) => setHeightExtra(e.target.value)}
              />
            </Field>
          </div>
        ) : (
          <Field label="Height">
            <Input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={heightPrimary}
              placeholder={
                heightUnit === "cm"
                  ? "170"
                  : heightUnit === "m"
                    ? "1.70"
                    : "67"
              }
              onChange={(e) => setHeightPrimary(e.target.value)}
            />
          </Field>
        )}
        <Field label="Weight unit">
          <Select
            value={weightUnit}
            onChange={(e) => changeWeightUnit(e.target.value as BmrWeightUnit)}
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="lb">Pounds (lb)</option>
            <option value="stlb">Stone and pounds</option>
            <option value="st">Stone (st)</option>
          </Select>
        </Field>
        {weightUnit === "stlb" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stone">
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={weightPrimary}
                placeholder="10"
                onChange={(e) => setWeightPrimary(e.target.value)}
              />
            </Field>
            <Field label="Pounds">
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={weightExtra}
                placeholder="8"
                onChange={(e) => setWeightExtra(e.target.value)}
              />
            </Field>
          </div>
        ) : (
          <Field label="Weight">
            <Input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={weightPrimary}
              placeholder={
                weightUnit === "kg" ? "65" : weightUnit === "lb" ? "143" : "10.2"
              }
              onChange={(e) => setWeightPrimary(e.target.value)}
            />
          </Field>
        )}
        <Field label="Sex">
          <Select value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </Field>
        <Field label="Activity level">
          <Select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="1.2">Sedentary (desk work, little exercise)</option>
            <option value="1.375">Light (exercise 1 to 3 days a week)</option>
            <option value="1.55">Moderate (exercise 3 to 5 days a week)</option>
            <option value="1.725">Active (exercise 6 to 7 days a week)</option>
            <option value="1.9">Very active (hard training or physical job)</option>
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
  const [heightUnit, setHeightUnit] = useState<BmrHeightUnit>("cm");
  const [heightPrimary, setHeightPrimary] = useState("");
  const [heightExtra, setHeightExtra] = useState("");
  const [weightUnit, setWeightUnit] = useState<BmrWeightUnit>("kg");
  const [weightPrimary, setWeightPrimary] = useState("");
  const [weightExtra, setWeightExtra] = useState("");
  const [sex, setSex] = useState("male");

  function changeHeightUnit(next: BmrHeightUnit) {
    const cm = bmrHeightToCm(heightUnit, heightPrimary, heightExtra);
    if (cm != null) {
      const converted = bmrCmToHeight(next, cm);
      setHeightPrimary(converted.primary);
      setHeightExtra(converted.extra);
    } else {
      setHeightExtra("");
    }
    setHeightUnit(next);
  }

  function changeWeightUnit(next: BmrWeightUnit) {
    const kg = bmrWeightToKg(weightUnit, weightPrimary, weightExtra);
    if (kg != null) {
      const converted = bmrKgToWeight(next, kg);
      setWeightPrimary(converted.primary);
      setWeightExtra(converted.extra);
    } else {
      setWeightExtra("");
    }
    setWeightUnit(next);
  }

  const bmr = useMemo(() => {
    const a = parseNumber(age);
    const h = bmrHeightToCm(heightUnit, heightPrimary, heightExtra);
    const w = bmrWeightToKg(weightUnit, weightPrimary, weightExtra);
    if (a == null || h == null || w == null || a <= 0) return null;
    return mifflin(w, h, a, sex === "male");
  }, [
    age,
    heightUnit,
    heightPrimary,
    heightExtra,
    weightUnit,
    weightPrimary,
    weightExtra,
    sex,
  ]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Age (years)">
          <Input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={age}
            placeholder="30"
            onChange={(e) => setAge(e.target.value)}
          />
        </Field>
        <Field label="Height unit">
          <Select
            value={heightUnit}
            onChange={(e) => changeHeightUnit(e.target.value as BmrHeightUnit)}
          >
            <option value="cm">Centimeters (cm)</option>
            <option value="m">Meters (m)</option>
            <option value="ftin">Feet and inches</option>
            <option value="in">Inches (in)</option>
          </Select>
        </Field>
        {heightUnit === "ftin" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Feet">
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={heightPrimary}
                placeholder="5"
                onChange={(e) => setHeightPrimary(e.target.value)}
              />
            </Field>
            <Field label="Inches">
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={heightExtra}
                placeholder="10"
                onChange={(e) => setHeightExtra(e.target.value)}
              />
            </Field>
          </div>
        ) : (
          <Field label="Height">
            <Input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={heightPrimary}
              placeholder={
                heightUnit === "cm"
                  ? "170"
                  : heightUnit === "m"
                    ? "1.70"
                    : "67"
              }
              onChange={(e) => setHeightPrimary(e.target.value)}
            />
          </Field>
        )}
        <Field label="Weight unit">
          <Select
            value={weightUnit}
            onChange={(e) => changeWeightUnit(e.target.value as BmrWeightUnit)}
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="lb">Pounds (lb)</option>
            <option value="stlb">Stone and pounds</option>
            <option value="st">Stone (st)</option>
          </Select>
        </Field>
        {weightUnit === "stlb" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stone">
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={weightPrimary}
                placeholder="10"
                onChange={(e) => setWeightPrimary(e.target.value)}
              />
            </Field>
            <Field label="Pounds">
              <Input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={weightExtra}
                placeholder="8"
                onChange={(e) => setWeightExtra(e.target.value)}
              />
            </Field>
          </div>
        ) : (
          <Field label="Weight">
            <Input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={weightPrimary}
              placeholder={
                weightUnit === "kg" ? "65" : weightUnit === "lb" ? "143" : "10.2"
              }
              onChange={(e) => setWeightPrimary(e.target.value)}
            />
          </Field>
        )}
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

function money(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [n, setN] = useState("12");
  const result = useMemo(() => {
    const p = parseNumber(principal);
    const r = parseNumber(rate);
    const t = parseNumber(years);
    const times = parseNumber(n);
    if (
      p == null ||
      r == null ||
      t == null ||
      times == null ||
      p < 0 ||
      r < 0 ||
      t < 0 ||
      times <= 0
    ) {
      return null;
    }
    const future = p * (1 + r / 100 / times) ** (times * t);
    if (!Number.isFinite(future)) return null;
    return { future, interest: future - p };
  }, [principal, rate, years, n]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Starting amount">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={principal}
            placeholder="10000"
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </Field>
        <Field label="Annual interest percent">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={rate}
            placeholder="8"
            onChange={(e) => setRate(e.target.value)}
          />
        </Field>
        <Field label="Time (years)">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={years}
            placeholder="5"
            onChange={(e) => setYears(e.target.value)}
          />
        </Field>
        <Field label="Compounded">
          <Select value={n} onChange={(e) => setN(e.target.value)}>
            <option value="1">Once a year</option>
            <option value="4">Every 3 months</option>
            <option value="12">Every month</option>
            <option value="365">Every day</option>
          </Select>
        </Field>
      </div>
      <Box>
        <Result
          label="Amount after interest"
          value={result == null ? "—" : money(result.future)}
          steel
        />
        <Result
          label="Interest earned"
          value={result == null ? "—" : money(result.interest)}
        />
      </Box>
    </div>
  );
}

export function GstCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState("add");
  const parsed = parseNumber(amount);
  const pct = parseNumber(rate);
  const valid =
    parsed != null && pct != null && parsed >= 0 && pct >= 0 && pct < 1000;
  const adding = mode === "add";
  const tax = !valid
    ? null
    : adding
      ? (parsed * pct) / 100
      : parsed - parsed / (1 + pct / 100);
  const other = !valid || tax == null ? null : adding ? parsed + tax : parsed - tax;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="What do you want to do">
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="add">Add GST to a price</option>
            <option value="remove">Take GST out of a price</option>
          </Select>
        </Field>
        <Field label={adding ? "Amount before tax" : "Amount including tax"}>
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={amount}
            placeholder="1000"
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label="GST or VAT percent">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={rate}
            placeholder="18"
            onChange={(e) => setRate(e.target.value)}
          />
        </Field>
      </div>
      <Box>
        <Result label="Tax amount" value={tax == null ? "—" : money(tax)} />
        <Result
          label={adding ? "Amount with tax" : "Amount before tax"}
          value={other == null ? "—" : money(other)}
          steel
        />
      </Box>
    </div>
  );
}

export function TipCalculator() {
  const [bill, setBill] = useState("");
  const [tip, setTip] = useState("15");
  const [people, setPeople] = useState("1");
  const parsedBill = parseNumber(bill);
  const parsedTip = parseNumber(tip);
  const parsedPeople = parseNumber(people);
  const tipAmt =
    parsedBill == null || parsedTip == null || parsedBill < 0 || parsedTip < 0
      ? null
      : (parsedBill * parsedTip) / 100;
  const peopleCount =
    parsedPeople != null && parsedPeople >= 1 ? parsedPeople : 1;
  const each =
    tipAmt == null || parsedBill == null
      ? null
      : (parsedBill + tipAmt) / peopleCount;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Bill amount">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={bill}
            placeholder="50"
            onChange={(e) => setBill(e.target.value)}
          />
        </Field>
        <Field label="Tip percent">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={tip}
            placeholder="15"
            onChange={(e) => setTip(e.target.value)}
          />
        </Field>
        <Field label="Number of people">
          <Input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={people}
            placeholder="1"
            onChange={(e) => setPeople(e.target.value)}
          />
        </Field>
      </div>
      <Box>
        <Result
          label="Total tip"
          value={tipAmt == null ? "—" : `$${tipAmt.toFixed(2)}`}
        />
        <Result
          label="Each person pays"
          value={each == null ? "—" : `$${each.toFixed(2)}`}
          steel
        />
      </Box>
    </div>
  );
}

export function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [off, setOff] = useState("");
  const p = parseNumber(price);
  const d = parseNumber(off);
  const saved =
    p == null || d == null || p < 0 || d < 0 || d > 100 ? null : (p * d) / 100;
  const final = saved == null || p == null ? null : p - saved;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Original price">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={price}
            placeholder="80"
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>
        <Field label="Discount percent">
          <Input
            type="number"
            min="0"
            max="100"
            step="any"
            inputMode="decimal"
            value={off}
            placeholder="20"
            onChange={(e) => setOff(e.target.value)}
          />
        </Field>
      </div>
      <Box>
        <Result label="You save" value={saved == null ? "—" : money(saved)} />
        <Result
          label="Price after discount"
          value={final == null ? "—" : money(final)}
          steel
        />
      </Box>
    </div>
  );
}

export function SipCalculator() {
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const result = useMemo(() => {
    const pmt = parseNumber(monthly);
    const r = parseNumber(rate);
    const t = parseNumber(years);
    if (pmt == null || r == null || t == null || pmt < 0 || r < 0 || t <= 0) {
      return null;
    }
    const i = (1 + r / 100) ** (1 / 12) - 1;
    const n = t * 12;
    const future =
      i === 0 ? pmt * n : pmt * (((1 + i) ** n - 1) / i) * (1 + i);
    if (!Number.isFinite(future)) return null;
    return { future, invested: pmt * n };
  }, [monthly, rate, years]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Monthly investment">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={monthly}
            placeholder="5000"
            onChange={(e) => setMonthly(e.target.value)}
          />
        </Field>
        <Field label="Expected annual return percent">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={rate}
            placeholder="12"
            onChange={(e) => setRate(e.target.value)}
          />
        </Field>
        <Field label="Investment period (years)">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={years}
            placeholder="10"
            onChange={(e) => setYears(e.target.value)}
          />
        </Field>
      </div>
      <Box>
        <Result
          label="Estimated maturity"
          value={result == null ? "—" : money(result.future)}
          steel
        />
        <Result
          label="Total invested"
          value={result == null ? "—" : money(result.invested)}
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
    p == null || r == null || t == null || p < 0 || r < 0 || t < 0
      ? null
      : (p * r * t) / 100;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Starting amount">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={principal}
            placeholder="10000"
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </Field>
        <Field label="Annual interest percent">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={rate}
            placeholder="8"
            onChange={(e) => setRate(e.target.value)}
          />
        </Field>
        <Field label="Time (years)">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={years}
            placeholder="3"
            onChange={(e) => setYears(e.target.value)}
          />
        </Field>
      </div>
      <Box>
        <Result
          label="Interest earned"
          value={interest == null ? "—" : money(interest)}
        />
        <Result
          label="Total amount"
          value={interest == null || p == null ? "—" : money(p + interest)}
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

export function PeriodCalculator() {
  const [lmp, setLmp] = useState("");
  const [cycle, setCycle] = useState("");
  const result = useMemo(() => {
    if (!lmp) return null;
    const length = parseNumber(cycle);
    if (length == null || length < 20 || length > 45) return null;
    const start = new Date(`${lmp}T00:00:00`);
    if (Number.isNaN(start.getTime())) return null;
    const next = new Date(start);
    next.setDate(start.getDate() + length);
    const end = new Date(next);
    end.setDate(next.getDate() + 4);
    const following = new Date(next);
    following.setDate(next.getDate() + length);
    return {
      next: localISODate(next),
      end: localISODate(end),
      following: localISODate(following),
    };
  }, [lmp, cycle]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Last period (first day)">
          <Input
            type="date"
            value={lmp}
            max={localISODate(new Date())}
            onChange={(e) => setLmp(e.target.value)}
          />
        </Field>
        <Field label="Cycle length (days)">
          <Input
            type="number"
            value={cycle}
            placeholder="0"
            onChange={(e) => setCycle(e.target.value)}
          />
        </Field>
      </div>
      <Box>
        <Result label="Next period" value={result?.next ?? "—"} />
        <Result label="Expected end" value={result?.end ?? "—"} steel />
        <Result label="Period after that" value={result?.following ?? "—"} />
      </Box>
    </div>
  );
}

export function FdCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const result = useMemo(() => {
    const p = parseNumber(principal);
    const r = parseNumber(rate);
    const t = parseNumber(years);
    if (p == null || r == null || t == null || p < 0 || r < 0 || t <= 0) {
      return null;
    }
    const n = 4;
    const future = p * (1 + r / 100 / n) ** (n * t);
    if (!Number.isFinite(future)) return null;
    return { future, interest: future - p };
  }, [principal, rate, years]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Deposit amount">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={principal}
            placeholder="100000"
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </Field>
        <Field label="Annual interest percent">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={rate}
            placeholder="7"
            onChange={(e) => setRate(e.target.value)}
          />
        </Field>
        <Field label="Tenure (years)">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={years}
            placeholder="5"
            onChange={(e) => setYears(e.target.value)}
          />
        </Field>
      </div>
      <Box>
        <Result
          label="Maturity amount"
          value={result == null ? "—" : money(result.future)}
          steel
        />
        <Result
          label="Interest earned"
          value={result == null ? "—" : money(result.interest)}
        />
      </Box>
    </div>
  );
}

export function JsonFormatter() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("beautify");
  const out = useMemo(() => {
    if (!text.trim()) return "";
    try {
      const parsed = JSON.parse(text) as unknown;
      return mode === "minify"
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
    } catch {
      return "Invalid JSON";
    }
  }, [text, mode]);

  return (
    <div className="grid gap-6">
      <Field label="Mode">
        <Select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="beautify">Beautify</option>
          <option value="minify">Minify</option>
        </Select>
      </Field>
      <Textarea
        rows={5}
        value={text}
        placeholder="Paste JSON"
        onChange={(e) => setText(e.target.value)}
      />
      <Box>
        <div className="text-text whitespace-pre-wrap break-all font-mono text-[15px]">
          {out || "—"}
        </div>
      </Box>
    </div>
  );
}

const TIME_ZONE_FALLBACK = [
  "UTC",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/New_York",
  "America/Sao_Paulo",
  "America/Toronto",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Paris",
  "Pacific/Auckland",
];

function isValidTimeZone(timeZone: string) {
  if (!timeZone.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function allTimeZoneIds() {
  let raw = TIME_ZONE_FALLBACK;
  try {
    const intl = Intl as typeof Intl & {
      supportedValuesOf?: (key: "timeZone") => string[];
    };
    const zones = intl.supportedValuesOf?.("timeZone");
    if (zones && zones.length > 0) {
      raw = zones.includes("UTC") ? [...zones] : ["UTC", ...zones];
    }
  } catch {
    raw = TIME_ZONE_FALLBACK;
  }
  const unique = Array.from(
    new Set(raw.map((zone) => zone.trim()).filter(Boolean)),
  );
  for (const extra of ["UTC", "Asia/Karachi"]) {
    if (!unique.includes(extra) && isValidTimeZone(extra)) {
      unique.unshift(extra);
    }
  }
  return unique.filter(isValidTimeZone);
}

const TIME_ZONES = allTimeZoneIds();
const DEFAULT_FROM = TIME_ZONES.includes("UTC") ? "UTC" : (TIME_ZONES[0] ?? "UTC");
const DEFAULT_TO = TIME_ZONES.includes("Asia/Karachi")
  ? "Asia/Karachi"
  : DEFAULT_FROM;

function timeZoneLabel(id: string) {
  return id.replaceAll("_", " ");
}

function parseDateInTimeZone(localValue: string, timeZone: string) {
  if (!isValidTimeZone(timeZone)) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(localValue);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utcGuess));
  const num = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  const asIf = Date.UTC(
    num("year"),
    num("month") - 1,
    num("day"),
    num("hour"),
    num("minute"),
  );
  if (!Number.isFinite(asIf)) return null;
  return new Date(utcGuess - (asIf - utcGuess));
}

function formatInTimeZone(date: Date, timeZone: string) {
  if (!isValidTimeZone(timeZone)) return null;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function TimeZoneConverter() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const converted = useMemo(() => {
    const clock = time.slice(0, 5);
    if (!date || !clock || !isValidTimeZone(from) || !isValidTimeZone(to)) {
      return null;
    }
    const parsed = parseDateInTimeZone(`${date}T${clock}`, from);
    if (!parsed || Number.isNaN(parsed.getTime())) return null;
    return formatInTimeZone(parsed, to);
  }, [date, time, from, to]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Date">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="tz-picker-icon"
          />
        </Field>
        <Field label="Time">
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="tz-picker-icon"
          />
        </Field>
        <Field label="From time zone">
          <Select
            value={from}
            onChange={(e) => {
              if (isValidTimeZone(e.target.value)) setFrom(e.target.value);
            }}
          >
            {TIME_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {timeZoneLabel(zone)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="To time zone">
          <Select
            value={to}
            onChange={(e) => {
              if (isValidTimeZone(e.target.value)) setTo(e.target.value);
            }}
          >
            {TIME_ZONES.map((zone) => (
              <option key={`to-${zone}`} value={zone}>
                {timeZoneLabel(zone)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Box>
        <Result label="Converted time" value={converted ?? "—"} steel />
      </Box>
    </div>
  );
}

function parseClock(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const SLEEP_CYCLES = [
  { cycles: 6, hours: "9 hrs" },
  { cycles: 5, hours: "7.5 hrs" },
  { cycles: 4, hours: "6 hrs" },
] as const;

export function SleepCalculator() {
  const [mode, setMode] = useState("wake");
  const [clock, setClock] = useState("");
  const times = useMemo(() => {
    const start = parseClock(clock);
    if (!start) return null;
    const fallAsleep = 15;
    return SLEEP_CYCLES.map((item) => {
      const minutes = fallAsleep + item.cycles * 90;
      const next = new Date(start);
      next.setMinutes(start.getMinutes() + (mode === "wake" ? -minutes : minutes));
      return formatClock(next);
    });
  }, [mode, clock]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Find">
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="wake">Bedtime from wake time</option>
            <option value="bed">Wake time from bedtime</option>
          </Select>
        </Field>
        <Field label={mode === "wake" ? "Wake-up time" : "Bedtime"}>
          <Input
            type="time"
            value={clock}
            onChange={(e) => setClock(e.target.value)}
            className="tz-picker-icon"
          />
        </Field>
      </div>
      <Box>
        {SLEEP_CYCLES.map((item, index) => (
          <Result
            key={item.cycles}
            label={`${item.cycles} cycles (${item.hours})`}
            value={times?.[index] ?? "—"}
            steel={index % 2 === 1}
          />
        ))}
      </Box>
    </div>
  );
}

export function MortgageCalculator() {
  const [price, setPrice] = useState("");
  const [down, setDown] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const result = useMemo(() => {
    const home = parseNumber(price);
    const deposit = parseNumber(down) ?? 0;
    const annual = parseNumber(rate);
    const tenure = parseNumber(years);
    if (
      home == null ||
      annual == null ||
      tenure == null ||
      home <= 0 ||
      deposit < 0 ||
      deposit >= home ||
      tenure <= 0 ||
      annual < 0
    ) {
      return null;
    }
    const principal = home - deposit;
    const monthlyRate = annual / 12 / 100;
    const months = tenure * 12;
    const payment =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * (1 + monthlyRate) ** months) /
          ((1 + monthlyRate) ** months - 1);
    if (!Number.isFinite(payment) || payment <= 0) return null;
    const total = payment * months;
    return { payment, total, interest: total - principal, principal };
  }, [price, down, rate, years]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Home price">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={price}
            placeholder="350000"
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>
        <Field label="Down payment">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={down}
            placeholder="70000"
            onChange={(e) => setDown(e.target.value)}
          />
        </Field>
        <Field label="Annual interest percent">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={rate}
            placeholder="6.5"
            onChange={(e) => setRate(e.target.value)}
          />
        </Field>
        <Field label="Loan term (years)">
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={years}
            placeholder="30"
            onChange={(e) => setYears(e.target.value)}
          />
        </Field>
      </div>
      <Box>
        <Result
          label="Monthly payment"
          value={result == null ? "—" : money(result.payment)}
          hint="/mo"
          steel
        />
        <Result
          label="Total payable"
          value={result == null ? "—" : money(result.total)}
        />
        <Result
          label="Total interest"
          value={result == null ? "—" : money(result.interest)}
          steel
        />
      </Box>
    </div>
  );
}

function randomInt(min: number, max: number) {
  const span = max - min + 1;
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return min + (bytes[0] % span);
}

export function RandomNumberGenerator() {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [count, setCount] = useState("");
  const [numbers, setNumbers] = useState("");

  function generate() {
    const low = parseNumber(min);
    const high = parseNumber(max);
    const n = parseNumber(count);
    if (low == null || high == null || n == null || n < 1) return;
    const from = Math.min(Math.trunc(low), Math.trunc(high));
    const to = Math.max(Math.trunc(low), Math.trunc(high));
    const total = Math.min(100, Math.max(1, Math.trunc(n)));
    const values = Array.from({ length: total }, () => randomInt(from, to));
    setNumbers(values.join(", "));
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Minimum">
          <Input
            type="number"
            value={min}
            placeholder="1"
            onChange={(e) => setMin(e.target.value)}
          />
        </Field>
        <Field label="Maximum">
          <Input
            type="number"
            value={max}
            placeholder="100"
            onChange={(e) => setMax(e.target.value)}
          />
        </Field>
        <Field label="How many">
          <Input
            type="number"
            min="1"
            value={count}
            placeholder="1"
            onChange={(e) => setCount(e.target.value)}
          />
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
        <Result label="Random number" value={numbers || "—"} steel />
      </Box>
    </div>
  );
}

export function GpaCalculator() {
  const [mode, setMode] = useState("credits");
  const [primary, setPrimary] = useState("");
  const [credits, setCredits] = useState("");
  const [scale, setScale] = useState("10");
  const result = useMemo(() => {
    const a = parseNumber(primary);
    if (a == null) return null;
    if (mode === "credits") {
      const hours = parseNumber(credits);
      if (hours == null || hours <= 0 || a < 0) return null;
      const gpa = a / hours;
      return Number.isFinite(gpa) ? gpa.toFixed(2) : null;
    }
    if (mode === "percent-gpa") {
      if (a < 0 || a > 100) return null;
      return Math.min(4, a / 25).toFixed(2);
    }
    const max = scale === "4" ? 4 : 10;
    if (mode === "cgpa-percent") {
      if (a < 0 || a > max) return null;
      const percent = max === 10 ? a * 9.5 : (a / 4) * 100;
      return `${percent.toFixed(1)}%`;
    }
    if (a < 0 || a > 100) return null;
    const cgpa = max === 10 ? a / 9.5 : (a / 100) * 4;
    return cgpa.toFixed(2);
  }, [mode, primary, credits, scale]);

  const primaryLabel =
    mode === "credits"
      ? "Total grade points"
      : mode === "cgpa-percent"
        ? "CGPA"
        : "Percentage";
  const showScale = mode === "cgpa-percent" || mode === "percent-cgpa";
  const resultLabel =
    mode === "cgpa-percent"
      ? "Percentage"
      : mode === "credits"
        ? "GPA"
        : mode === "percent-gpa"
          ? "GPA (4.0)"
          : "CGPA";

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        <Field label="Mode">
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="credits">GPA from credits</option>
            <option value="percent-gpa">Percentage to GPA (4.0)</option>
            <option value="cgpa-percent">CGPA to percentage</option>
            <option value="percent-cgpa">Percentage to CGPA</option>
          </Select>
        </Field>
        <Field label={primaryLabel}>
          <Input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={primary}
            placeholder={
              mode === "credits"
                ? "36"
                : mode === "cgpa-percent"
                  ? "8.2"
                  : "85"
            }
            onChange={(e) => setPrimary(e.target.value)}
          />
        </Field>
        {mode === "credits" ? (
          <Field label="Total credit hours">
            <Input
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={credits}
              placeholder="12"
              onChange={(e) => setCredits(e.target.value)}
            />
          </Field>
        ) : null}
        {showScale ? (
          <Field label="CGPA scale">
            <Select value={scale} onChange={(e) => setScale(e.target.value)}>
              <option value="10">10-point</option>
              <option value="4">4-point</option>
            </Select>
          </Field>
        ) : null}
      </div>
      <Box>
        <Result label={resultLabel} value={result ?? "—"} steel />
      </Box>
    </div>
  );
}
