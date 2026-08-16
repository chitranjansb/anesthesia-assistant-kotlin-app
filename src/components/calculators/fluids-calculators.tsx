"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  maintenanceFluidRateMlPerHr,
  npoFluidDeficitMl,
  parklandFormula,
  estimatedBloodVolumeMl,
  allowableBloodLossMl,
  EBV_ML_PER_KG,
} from "@/lib/calculators";

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
        {typeof value === "number" ? value.toFixed(0) : value} {unit}
      </span>
    </div>
  );
}

export function MaintenanceFluidsCalculator() {
  const weight = useNum(25);
  const rate = maintenanceFluidRateMlPerHr(weight.value);

  return (
    <Card id="maintenance-fluids">
      <CardHeader>
        <CardTitle>Maintenance fluids — 4-2-1 rule</CardTitle>
        <CardDescription>Holliday-Segar hourly maintenance rate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Weight (kg)</Label>
          <Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} />
        </div>
        <ResultRow label="Maintenance rate" value={rate} unit="mL/hr" />
      </CardContent>
    </Card>
  );
}

export function NpoDeficitCalculator() {
  const weight = useNum(25);
  const hours = useNum(8);
  const deficit = npoFluidDeficitMl(weight.value, hours.value);

  return (
    <Card id="npo-deficit">
      <CardHeader>
        <CardTitle>NPO fluid deficit</CardTitle>
        <CardDescription>Maintenance rate × hours fasted.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} />
          </div>
          <div>
            <Label>Hours NPO</Label>
            <Input type="number" value={hours.raw} onChange={(e) => hours.setRaw(e.target.value)} />
          </div>
        </div>
        <ResultRow label="Total deficit" value={deficit} unit="mL" />
        <p className="text-xs text-muted-foreground">
          Common teaching: replace 50% in the first hour, remaining 50% over the next two hours — confirm against
          your institutional protocol, especially for cardiac/renal patients.
        </p>
      </CardContent>
    </Card>
  );
}

export function ParklandCalculator() {
  const weight = useNum(70);
  const tbsa = useNum(20);
  const result = parklandFormula(weight.value, tbsa.value);

  return (
    <Card id="parkland">
      <CardHeader>
        <CardTitle>Parkland formula (burns)</CardTitle>
        <CardDescription>4 mL × weight(kg) × %TBSA, over 24h from time of injury.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} />
          </div>
          <div>
            <Label>% TBSA burned</Label>
            <Input type="number" value={tbsa.raw} onChange={(e) => tbsa.setRaw(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <ResultRow label="Total (24h)" value={result.total24hMl} unit="mL" />
          <ResultRow label="First 8h (from time of injury)" value={result.first8hMl} unit="mL" />
          <ResultRow label="Next 16h" value={result.next16hMl} unit="mL" />
        </div>
        <p className="text-xs text-muted-foreground">
          Timed from the burn injury, not from arrival — subtract fluid already given before this calculation.
        </p>
      </CardContent>
    </Card>
  );
}

export function BloodLossCalculator() {
  const weight = useNum(70);
  const [category, setCategory] = React.useState<keyof typeof EBV_ML_PER_KG>("adultMale");
  const hctInitial = useNum(40);
  const hctTarget = useNum(27);

  const ebv = estimatedBloodVolumeMl(weight.value, category);
  const abl = allowableBloodLossMl(ebv, hctInitial.value, hctTarget.value);

  return (
    <Card id="blood-loss">
      <CardHeader>
        <CardTitle>Estimated blood volume & allowable blood loss</CardTitle>
        <CardDescription>EBV by population category, then ABL from initial vs. target Hct.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="prematureNeonate">Premature neonate (~100 mL/kg)</SelectItem>
                <SelectItem value="termNeonate">Term neonate (~90 mL/kg)</SelectItem>
                <SelectItem value="infant">Infant (~80 mL/kg)</SelectItem>
                <SelectItem value="adultMale">Adult male (~75 mL/kg)</SelectItem>
                <SelectItem value="adultFemale">Adult female (~65 mL/kg)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Initial Hct (%)</Label>
            <Input type="number" value={hctInitial.raw} onChange={(e) => hctInitial.setRaw(e.target.value)} />
          </div>
          <div>
            <Label>Target Hct (%)</Label>
            <Input type="number" value={hctTarget.raw} onChange={(e) => hctTarget.setRaw(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <ResultRow label="Estimated blood volume" value={ebv} unit="mL" />
          <ResultRow label="Allowable blood loss" value={abl} unit="mL" />
        </div>
      </CardContent>
    </Card>
  );
}
