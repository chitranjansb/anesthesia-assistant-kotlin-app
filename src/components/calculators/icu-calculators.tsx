"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  predictedBodyWeightKg,
  lungProtectiveTidalVolumeMl,
  pfRatio,
  ardsSeverityBerlin,
  sfRatio,
  oxygenationIndex,
  drivingPressureCmH2O,
  minuteVentilationLPerMin,
  crrtEffluentRateMlPerHr,
  norepinephrineEquivalentMcgKgMin,
  type Sex,
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

export function LungProtectiveTvCalculator() {
  const height = useNum(170);
  const [sex, setSex] = React.useState<Sex>("male");
  const [mlPerKg, setMlPerKg] = React.useState(6);
  const pbw = predictedBodyWeightKg(height.value, sex);
  const tv = lungProtectiveTidalVolumeMl(pbw, mlPerKg);

  return (
    <Card id="lung-protective-tv">
      <CardHeader>
        <CardTitle>Lung-protective tidal volume</CardTitle>
        <CardDescription>ARDSnet target ~6 mL/kg predicted body weight (PBW), not actual weight. Typical safe range 4–8 mL/kg.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Height (cm)</Label><Input type="number" value={height.raw} onChange={(e) => height.setRaw(e.target.value)} /></div>
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
        </div>
        <div>
          <Label>Target (mL/kg PBW)</Label>
          <Select value={String(mlPerKg)} onValueChange={(v) => setMlPerKg(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 mL/kg</SelectItem>
              <SelectItem value="6">6 mL/kg (standard target)</SelectItem>
              <SelectItem value="8">8 mL/kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ResultRow label="Predicted body weight" value={pbw.toFixed(1)} unit="kg" />
        <ResultRow label="Target tidal volume" value={tv.toFixed(0)} unit="mL" />
      </CardContent>
    </Card>
  );
}

export function PfRatioCalculator() {
  const pao2 = useNum(80);
  const [fio2Percent, setFio2Percent] = React.useState(50);
  const peep = useNum(5);
  const [usePeep, setUsePeep] = React.useState(true);
  const fio2 = fio2Percent / 100;
  const ratio = pfRatio(pao2.value, fio2);
  const severity = ardsSeverityBerlin(ratio, usePeep ? peep.value : undefined);
  const isSevere = severity === "Severe" || severity === "Moderate";

  return (
    <Card id="pf-ratio">
      <CardHeader>
        <CardTitle>PaO2/FiO2 (P/F) ratio & ARDS severity</CardTitle>
        <CardDescription>Berlin definition (2012) bands. Formal Berlin criteria also require PEEP/CPAP ≥ 5 cmH2O.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>PaO2 (mmHg)</Label><Input type="number" value={pao2.raw} onChange={(e) => pao2.setRaw(e.target.value)} /></div>
          <div><Label>FiO2 (%)</Label><Input type="number" value={fio2Percent} onChange={(e) => setFio2Percent(Number(e.target.value))} /></div>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label>PEEP/CPAP (cmH2O)</Label>
            <Input type="number" value={peep.raw} onChange={(e) => peep.setRaw(e.target.value)} disabled={!usePeep} />
          </div>
          <button
            type="button"
            onClick={() => setUsePeep((v) => !v)}
            className="text-xs text-muted-foreground underline underline-offset-2 pb-2.5"
          >
            {usePeep ? "Ignore PEEP requirement" : "Apply PEEP requirement"}
          </button>
        </div>
        <ResultRow label="P/F ratio" value={ratio.toFixed(0)} />
        <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">ARDS severity band</span>
          <Badge variant={isSevere ? "critical" : "secondary"}>{severity}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function SfRatioCalculator() {
  const spo2 = useNum(96);
  const [fio2Percent, setFio2Percent] = React.useState(50);
  const ratio = sfRatio(spo2.value, fio2Percent / 100);

  return (
    <Card id="sf-ratio">
      <CardHeader>
        <CardTitle>SpO2/FiO2 (S/F) ratio</CardTitle>
        <CardDescription>Non-invasive surrogate for P/F when no arterial blood gas is available (Rice et al. 2007). S/F ≈ 235 roughly corresponds to P/F 200; S/F ≈ 315 to P/F 300 — use as a screening estimate only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>SpO2 (%)</Label><Input type="number" value={spo2.raw} onChange={(e) => spo2.setRaw(e.target.value)} /></div>
          <div><Label>FiO2 (%)</Label><Input type="number" value={fio2Percent} onChange={(e) => setFio2Percent(Number(e.target.value))} /></div>
        </div>
        <ResultRow label="S/F ratio" value={ratio.toFixed(0)} />
      </CardContent>
    </Card>
  );
}

export function OxygenationIndexCalculator() {
  const fio2Percent = useNum(60);
  const map = useNum(15);
  const pao2 = useNum(60);
  const oi = oxygenationIndex(fio2Percent.value / 100, map.value, pao2.value);

  return (
    <Card id="oxygenation-index">
      <CardHeader>
        <CardTitle>Oxygenation Index (OI)</CardTitle>
        <CardDescription>FiO2 × mean airway pressure × 100 / PaO2. Commonly used in pediatric/neonatal ICU and as an ECMO-referral trigger (institutional thresholds vary, often OI ≥ 25–40).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><Label>FiO2 (%)</Label><Input type="number" value={fio2Percent.raw} onChange={(e) => fio2Percent.setRaw(e.target.value)} /></div>
          <div><Label>Mean airway pressure (cmH2O)</Label><Input type="number" value={map.raw} onChange={(e) => map.setRaw(e.target.value)} /></div>
          <div><Label>PaO2 (mmHg)</Label><Input type="number" value={pao2.raw} onChange={(e) => pao2.setRaw(e.target.value)} /></div>
        </div>
        <ResultRow label="Oxygenation Index" value={oi.toFixed(1)} />
      </CardContent>
    </Card>
  );
}

export function DrivingPressureCalculator() {
  const plateau = useNum(24);
  const peep = useNum(8);
  const dp = drivingPressureCmH2O(plateau.value, peep.value);

  return (
    <Card id="driving-pressure">
      <CardHeader>
        <CardTitle>Driving pressure</CardTitle>
        <CardDescription>Plateau pressure − PEEP. Associated with mortality in ARDS independent of tidal volume; commonly taught target &lt; 15 cmH2O.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Plateau pressure (cmH2O)</Label><Input type="number" value={plateau.raw} onChange={(e) => plateau.setRaw(e.target.value)} /></div>
          <div><Label>PEEP (cmH2O)</Label><Input type="number" value={peep.raw} onChange={(e) => peep.setRaw(e.target.value)} /></div>
        </div>
        <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">Driving pressure</span>
          <div className="flex items-center gap-2">
            <span className="clinical-value text-sm font-semibold">{dp.toFixed(1)} cmH2O</span>
            {dp >= 15 && <Badge variant="review">Above typical target</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MinuteVentilationCalculator() {
  const tv = useNum(420);
  const rr = useNum(14);
  const mv = minuteVentilationLPerMin(tv.value, rr.value);

  return (
    <Card id="minute-ventilation">
      <CardHeader>
        <CardTitle>Minute ventilation</CardTitle>
        <CardDescription>Tidal volume × respiratory rate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Tidal volume (mL)</Label><Input type="number" value={tv.raw} onChange={(e) => tv.setRaw(e.target.value)} /></div>
          <div><Label>Respiratory rate (/min)</Label><Input type="number" value={rr.raw} onChange={(e) => rr.setRaw(e.target.value)} /></div>
        </div>
        <ResultRow label="Minute ventilation" value={mv.toFixed(1)} unit="L/min" />
      </CardContent>
    </Card>
  );
}

export function CrrtDoseCalculator() {
  const weight = useNum(70);
  const [dose, setDose] = React.useState(25);
  const rate = crrtEffluentRateMlPerHr(weight.value, dose);

  return (
    <Card id="crrt-dose">
      <CardHeader>
        <CardTitle>CRRT effluent dose</CardTitle>
        <CardDescription>Required effluent flow rate for a target dose. KDIGO-referenced teaching range 20–25 mL/kg/hr. Delivered dose typically runs ~20–25% below prescribed due to filter downtime — prescribing at the upper end is standard practice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Weight (kg)</Label><Input type="number" value={weight.raw} onChange={(e) => weight.setRaw(e.target.value)} /></div>
          <div>
            <Label>Target dose (mL/kg/hr)</Label>
            <Select value={String(dose)} onValueChange={(v) => setDose(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ResultRow label="Prescribed effluent rate" value={rate.toFixed(0)} unit="mL/hr" />
      </CardContent>
    </Card>
  );
}

export function NorepiEquivalentCalculator() {
  const ne = useNum(0);
  const epi = useNum(0);
  const dopa = useNum(0);
  const phenyl = useNum(0);
  const total = norepinephrineEquivalentMcgKgMin({
    norepinephrineMcgKgMin: ne.value,
    epinephrineMcgKgMin: epi.value,
    dopamineMcgKgMin: dopa.value,
    phenylephrineMcgKgMin: phenyl.value,
  });

  return (
    <Card id="norepi-equivalent">
      <CardHeader>
        <CardTitle>Norepinephrine-equivalent dose</CardTitle>
        <CardDescription>
          Rough comparative index of total vasopressor burden — NE and epinephrine counted 1:1, dopamine ÷100, phenylephrine ÷10
          (all mcg/kg/min). Vasopressin is deliberately excluded; it&apos;s usually run at a fixed dose and published conversion
          factors vary considerably between studies. This is a teaching approximation, not a validated clinical score.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Norepinephrine (mcg/kg/min)</Label><Input type="number" step="0.01" value={ne.raw} onChange={(e) => ne.setRaw(e.target.value)} /></div>
          <div><Label>Epinephrine (mcg/kg/min)</Label><Input type="number" step="0.01" value={epi.raw} onChange={(e) => epi.setRaw(e.target.value)} /></div>
          <div><Label>Dopamine (mcg/kg/min)</Label><Input type="number" step="0.1" value={dopa.raw} onChange={(e) => dopa.setRaw(e.target.value)} /></div>
          <div><Label>Phenylephrine (mcg/kg/min)</Label><Input type="number" step="0.1" value={phenyl.raw} onChange={(e) => phenyl.setRaw(e.target.value)} /></div>
        </div>
        <ResultRow label="Norepinephrine-equivalent" value={total.toFixed(3)} unit="mcg/kg/min" />
      </CardContent>
    </Card>
  );
}