"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { meanArterialPressure, anionGap, correctedSodium, correctedCalcium, aaGradient } from "@/lib/calculators";

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

export function MapCalculator() {
  const sbp = useNum(120);
  const dbp = useNum(80);
  return (
    <Card id="map">
      <CardHeader>
        <CardTitle>Mean arterial pressure</CardTitle>
        <CardDescription>MAP = DBP + ⅓(SBP − DBP)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Systolic BP</Label><Input type="number" value={sbp.raw} onChange={(e) => sbp.setRaw(e.target.value)} /></div>
          <div><Label>Diastolic BP</Label><Input type="number" value={dbp.raw} onChange={(e) => dbp.setRaw(e.target.value)} /></div>
        </div>
        <ResultRow label="MAP" value={meanArterialPressure(sbp.value, dbp.value)} unit="mmHg" />
      </CardContent>
    </Card>
  );
}

export function AnionGapCalculator() {
  const na = useNum(140);
  const cl = useNum(100);
  const hco3 = useNum(24);
  return (
    <Card id="anion-gap">
      <CardHeader>
        <CardTitle>Anion gap</CardTitle>
        <CardDescription>Na − (Cl + HCO₃)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Na (mEq/L)</Label><Input type="number" value={na.raw} onChange={(e) => na.setRaw(e.target.value)} /></div>
          <div><Label>Cl (mEq/L)</Label><Input type="number" value={cl.raw} onChange={(e) => cl.setRaw(e.target.value)} /></div>
          <div><Label>HCO₃ (mEq/L)</Label><Input type="number" value={hco3.raw} onChange={(e) => hco3.setRaw(e.target.value)} /></div>
        </div>
        <ResultRow label="Anion gap" value={anionGap(na.value, cl.value, hco3.value)} unit="mEq/L" />
      </CardContent>
    </Card>
  );
}

export function CorrectedSodiumCalculator() {
  const na = useNum(130);
  const glucose = useNum(400);
  return (
    <Card id="corrected-sodium">
      <CardHeader>
        <CardTitle>Corrected sodium (hyperglycemia)</CardTitle>
        <CardDescription>Katz formula: Na + 1.6 × ((glucose − 100)/100)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Measured Na (mEq/L)</Label><Input type="number" value={na.raw} onChange={(e) => na.setRaw(e.target.value)} /></div>
          <div><Label>Glucose (mg/dL)</Label><Input type="number" value={glucose.raw} onChange={(e) => glucose.setRaw(e.target.value)} /></div>
        </div>
        <ResultRow label="Corrected Na" value={correctedSodium(na.value, glucose.value)} unit="mEq/L" />
      </CardContent>
    </Card>
  );
}

export function CorrectedCalciumCalculator() {
  const ca = useNum(7.5);
  const albumin = useNum(2.5);
  return (
    <Card id="corrected-calcium">
      <CardHeader>
        <CardTitle>Corrected calcium (hypoalbuminemia)</CardTitle>
        <CardDescription>Corrected Ca = measured Ca + 0.8 × (4 − albumin g/dL)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Measured Ca (mg/dL)</Label><Input type="number" value={ca.raw} onChange={(e) => ca.setRaw(e.target.value)} /></div>
          <div><Label>Albumin (g/dL)</Label><Input type="number" value={albumin.raw} onChange={(e) => albumin.setRaw(e.target.value)} /></div>
        </div>
        <ResultRow label="Corrected Ca" value={correctedCalcium(ca.value, albumin.value)} unit="mg/dL" />
      </CardContent>
    </Card>
  );
}

export function AaGradientCalculator() {
  const fio2 = useNum(0.21);
  const paco2 = useNum(40);
  const pao2 = useNum(90);
  const { pAO2, gradient } = aaGradient({ fiO2: fio2.value, paCO2: paco2.value, paO2: pao2.value });

  return (
    <Card id="aa-gradient">
      <CardHeader>
        <CardTitle>A-a gradient</CardTitle>
        <CardDescription>Alveolar gas equation at sea level (R = 0.8).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><Label>FiO₂ (0.21–1.0)</Label><Input type="number" step="0.01" value={fio2.raw} onChange={(e) => fio2.setRaw(e.target.value)} /></div>
          <div><Label>PaCO₂ (mmHg)</Label><Input type="number" value={paco2.raw} onChange={(e) => paco2.setRaw(e.target.value)} /></div>
          <div><Label>PaO₂ (mmHg)</Label><Input type="number" value={pao2.raw} onChange={(e) => pao2.setRaw(e.target.value)} /></div>
        </div>
        <div className="space-y-2">
          <ResultRow label="Calculated PAO₂" value={pAO2} unit="mmHg" />
          <ResultRow label="A-a gradient" value={gradient} unit="mmHg" />
        </div>
      </CardContent>
    </Card>
  );
}
