"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  localAnestheticMaxDoseMg,
  localAnestheticDoseFromVolumeMg,
  type LocalAnesthetic,
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
        {value} {unit}
      </span>
    </div>
  );
}

const LA_LABELS: Record<LocalAnesthetic, string> = {
  lidocaine: "Lidocaine",
  bupivacaine: "Bupivacaine",
  ropivacaine: "Ropivacaine",
};

export function LaMaxDoseCalculator() {
  const [drug, setDrug] = React.useState<LocalAnesthetic>("bupivacaine");
  const [withEpi, setWithEpi] = React.useState(false);
  const weight = useNum(70);
  const volume = useNum(20);
  const [percent, setPercent] = React.useState(0.5);

  const maxDose = localAnestheticMaxDoseMg(drug, weight.value, withEpi);
  const plannedDose = localAnestheticDoseFromVolumeMg(volume.value, percent);
  const overLimit = plannedDose > maxDose;
  const pctOfMax = maxDose > 0 ? (plannedDose / maxDose) * 100 : 0;

  return (
    <Card id="la-max-dose">
      <CardHeader>
        <CardTitle>Local anesthetic maximum dose</CardTitle>
        <CardDescription>
          Commonly-taught mg/kg ceilings (plain vs. with epinephrine), checked against a planned volume + concentration.
          These figures vary between sources/institutions — treat as an approximate safety guardrail, not a substitute
          for your adopted reference, and always account for the total dose across <em>all</em> blocks/sites if more
          than one injection is planned in the same patient.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Local anesthetic</Label>
            <Select value={drug} onValueChange={(v) => setDrug(v as LocalAnesthetic)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(LA_LABELS) as LocalAnesthetic[]).map((d) => (
                  <SelectItem key={d} value={d}>{LA_LABELS[d]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>With epinephrine?</Label>
            <Select value={withEpi ? "yes" : "no"} onValueChange={(v) => setWithEpi(v === "yes")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">Plain (no epinephrine)</SelectItem>
                <SelectItem value="yes">With epinephrine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Patient weight (kg)</Label><Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} /></div>
          <div>
            <Label>Concentration (%)</Label>
            <Input type="number" step="0.05" value={percent} onChange={(e) => setPercent(Number(e.target.value) || 0)} />
          </div>
          <div className="col-span-2">
            <Label>Planned total volume, all sites (mL)</Label>
            <Input type="number" value={volume.raw} onChange={(e) => volume.setRaw(e.target.value)} />
          </div>
        </div>

        <ResultRow label="Maximum dose for this patient" value={maxDose.toFixed(0)} unit="mg" />
        <ResultRow label="Planned dose" value={plannedDose.toFixed(0)} unit="mg" />

        <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">% of maximum</span>
          <div className="flex items-center gap-2">
            <span className="clinical-value text-sm font-semibold">{pctOfMax.toFixed(0)}%</span>
            {overLimit && <Badge variant="critical">Exceeds max — recalculate before injecting</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
