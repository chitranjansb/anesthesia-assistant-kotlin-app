"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  bmi,
  idealBodyWeight,
  leanBodyWeight,
  adjustedBodyWeight,
  weightBasedDoseMg,
  mcgKgMinToMlPerHr,
  mgKgHrToMlPerHr,
  type Sex,
} from "@/lib/calculators";
import { useLogRecent } from "@/lib/use-log-recent";

function useNum(initial: number) {
  const [raw, setRaw] = React.useState(String(initial));
  const value = parseFloat(raw);
  return { raw, setRaw, value: Number.isFinite(value) ? value : 0 };
}

function ResultRow({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="clinical-value text-sm font-semibold">
        {typeof value === "number" ? value.toFixed(1) : value} {unit}
      </span>
    </div>
  );
}

export function BmiIbwCalculator() {
  useLogRecent("calculator", "bmi-ibw-lbw-abw");
  const weight = useNum(70);
  const height = useNum(170);
  const [sex, setSex] = React.useState<Sex>("male");

  const bmiVal = bmi(weight.value, height.value);
  const ibw = idealBodyWeight(height.value, sex);
  const lbw = leanBodyWeight(weight.value, height.value, sex);
  const abw = adjustedBodyWeight(weight.value, ibw);

  return (
    <Card id="bmi-ibw-lbw-abw">
      <CardHeader>
        <CardTitle>BMI · IBW · LBW · ABW</CardTitle>
        <CardDescription>Devine IBW, Boer LBW, adjusted body weight for dosing in obesity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} />
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Input type="number" value={height.raw} onChange={(e) => height.setRaw(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Sex</Label>
          <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 pt-2">
          <ResultRow label="BMI" value={bmiVal} unit="kg/m²" />
          <ResultRow label="Ideal body weight (Devine)" value={ibw} unit="kg" />
          <ResultRow label="Lean body weight (Boer)" value={lbw} unit="kg" />
          <ResultRow label="Adjusted body weight" value={abw} unit="kg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function WeightDoseCalculator() {
  useLogRecent("calculator", "weight-dose");
  const dosePerKg = useNum(1);
  const weight = useNum(70);
  const result = weightBasedDoseMg(dosePerKg.value, weight.value);

  return (
    <Card id="weight-dose">
      <CardHeader>
        <CardTitle>Weight-based dose</CardTitle>
        <CardDescription>mg/kg × weight → total mg. Confirm the per-kg dose against the Drug Handbook first.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Dose (mg/kg)</Label>
            <Input type="number" value={dosePerKg.raw} onChange={(e) => dosePerKg.setRaw(e.target.value)} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} />
          </div>
        </div>
        <ResultRow label="Total dose" value={result} unit="mg" />
      </CardContent>
    </Card>
  );
}

export function InfusionRateCalculator() {
  useLogRecent("calculator", "infusion-rate");
  const [mode, setMode] = React.useState<"mcgKgMin" | "mgKgHr">("mcgKgMin");
  const dose = useNum(0.1);
  const weight = useNum(70);
  const concentration = useNum(16);

  const rate =
    mode === "mcgKgMin"
      ? mcgKgMinToMlPerHr(dose.value, weight.value, concentration.value)
      : mgKgHrToMlPerHr(dose.value, weight.value, concentration.value);

  return (
    <Card id="infusion-rate">
      <CardHeader>
        <CardTitle>Infusion rate converter</CardTitle>
        <CardDescription>Convert a weight-based infusion order into a pump rate (mL/hr).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Order type</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mcgKgMin">mcg/kg/min</SelectItem>
              <SelectItem value="mgKgHr">mg/kg/hr</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Dose ({mode === "mcgKgMin" ? "mcg/kg/min" : "mg/kg/hr"})</Label>
            <Input type="number" step="0.01" value={dose.raw} onChange={(e) => dose.setRaw(e.target.value)} />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} />
          </div>
          <div>
            <Label>Concentration ({mode === "mcgKgMin" ? "mcg/mL" : "mg/mL"})</Label>
            <Input type="number" value={concentration.raw} onChange={(e) => concentration.setRaw(e.target.value)} />
          </div>
        </div>
        <ResultRow label="Pump rate" value={rate} unit="mL/hr" />
      </CardContent>
    </Card>
  );
}
