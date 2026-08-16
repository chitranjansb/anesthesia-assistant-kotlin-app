"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  gcsTotal,
  apfelScore,
  rcriScore,
  stopBangScore,
  childPughScore,
  meldScore,
  news2Total,
  sofaTotal,
  qsofaScore,
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

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <Label className="font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function GcsCalculator() {
  const [eye, setEye] = React.useState(4);
  const [verbal, setVerbal] = React.useState(5);
  const [motor, setMotor] = React.useState(6);
  const total = gcsTotal(eye, verbal, motor);

  return (
    <Card id="gcs">
      <CardHeader>
        <CardTitle>Glasgow Coma Scale</CardTitle>
        <CardDescription>Eye + Verbal + Motor. Range 3–15.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Eye opening (1–4)</Label>
          <Select value={String(eye)} onValueChange={(v) => setEye(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 — Spontaneous</SelectItem>
              <SelectItem value="3">3 — To voice</SelectItem>
              <SelectItem value="2">2 — To pain</SelectItem>
              <SelectItem value="1">1 — None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Verbal response (1–5)</Label>
          <Select value={String(verbal)} onValueChange={(v) => setVerbal(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 — Oriented</SelectItem>
              <SelectItem value="4">4 — Confused</SelectItem>
              <SelectItem value="3">3 — Inappropriate words</SelectItem>
              <SelectItem value="2">2 — Incomprehensible sounds</SelectItem>
              <SelectItem value="1">1 — None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Motor response (1–6)</Label>
          <Select value={String(motor)} onValueChange={(v) => setMotor(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 — Obeys commands</SelectItem>
              <SelectItem value="5">5 — Localizes pain</SelectItem>
              <SelectItem value="4">4 — Withdraws from pain</SelectItem>
              <SelectItem value="3">3 — Abnormal flexion</SelectItem>
              <SelectItem value="2">2 — Extension</SelectItem>
              <SelectItem value="1">1 — None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ResultRow label="GCS total" value={total} unit="/ 15" />
      </CardContent>
    </Card>
  );
}

export function ApfelCalculator() {
  const [female, setFemale] = React.useState(false);
  const [nonSmoker, setNonSmoker] = React.useState(false);
  const [history, setHistory] = React.useState(false);
  const [opioids, setOpioids] = React.useState(false);
  const { score, approxRiskPercent } = apfelScore({
    female,
    nonSmoker,
    historyPonvOrMotionSickness: history,
    postopOpioids: opioids,
  });

  return (
    <Card id="apfel">
      <CardHeader>
        <CardTitle>Apfel PONV risk score</CardTitle>
        <CardDescription>Simplified 4-factor postoperative nausea/vomiting risk score.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <ToggleRow label="Female sex" checked={female} onChange={setFemale} />
        <ToggleRow label="Non-smoker" checked={nonSmoker} onChange={setNonSmoker} />
        <ToggleRow label="History of PONV or motion sickness" checked={history} onChange={setHistory} />
        <ToggleRow label="Planned postoperative opioids" checked={opioids} onChange={setOpioids} />
        <div className="pt-3">
          <ResultRow label={`Score ${score}/4 — approx. risk`} value={approxRiskPercent} unit="%" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RcriCalculator() {
  const [factors, setFactors] = React.useState({
    highRiskSurgery: false,
    ischemicHeartDisease: false,
    congestiveHeartFailure: false,
    cerebrovascularDisease: false,
    insulinDependentDiabetes: false,
    renalInsufficiency: false,
  });
  const { score, approxRiskPercent } = rcriScore(factors);
  const set = (k: keyof typeof factors) => (v: boolean) => setFactors((f) => ({ ...f, [k]: v }));

  return (
    <Card id="rcri">
      <CardHeader>
        <CardTitle>Revised Cardiac Risk Index (Lee)</CardTitle>
        <CardDescription>6-factor perioperative major cardiac event risk index.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <ToggleRow label="High-risk surgery (intraperitoneal/intrathoracic/suprainguinal vascular)" checked={factors.highRiskSurgery} onChange={set("highRiskSurgery")} />
        <ToggleRow label="Ischemic heart disease" checked={factors.ischemicHeartDisease} onChange={set("ischemicHeartDisease")} />
        <ToggleRow label="Congestive heart failure (history)" checked={factors.congestiveHeartFailure} onChange={set("congestiveHeartFailure")} />
        <ToggleRow label="Cerebrovascular disease (history)" checked={factors.cerebrovascularDisease} onChange={set("cerebrovascularDisease")} />
        <ToggleRow label="Insulin-dependent diabetes" checked={factors.insulinDependentDiabetes} onChange={set("insulinDependentDiabetes")} />
        <ToggleRow label="Renal insufficiency (creatinine > 2 mg/dL)" checked={factors.renalInsufficiency} onChange={set("renalInsufficiency")} />
        <div className="pt-3">
          <ResultRow label={`Score ${score}/6 — approx. major cardiac event risk`} value={approxRiskPercent} unit="%" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StopBangCalculator() {
  const [a, setA] = React.useState({
    snoring: false,
    tiredness: false,
    observedApnea: false,
    bloodPressureHigh: false,
    bmiOver35: false,
    ageOver50: false,
    neckCircumferenceOver40cm: false,
    maleGender: false,
  });
  const { score, risk } = stopBangScore(a);
  const set = (k: keyof typeof a) => (v: boolean) => setA((f) => ({ ...f, [k]: v }));

  return (
    <Card id="stop-bang">
      <CardHeader>
        <CardTitle>STOP-BANG</CardTitle>
        <CardDescription>8-item obstructive sleep apnea screening questionnaire.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <ToggleRow label="Snoring loudly" checked={a.snoring} onChange={set("snoring")} />
        <ToggleRow label="Tired/fatigued during the day" checked={a.tiredness} onChange={set("tiredness")} />
        <ToggleRow label="Observed apnea during sleep" checked={a.observedApnea} onChange={set("observedApnea")} />
        <ToggleRow label="Treated for high blood pressure" checked={a.bloodPressureHigh} onChange={set("bloodPressureHigh")} />
        <ToggleRow label="BMI > 35 kg/m²" checked={a.bmiOver35} onChange={set("bmiOver35")} />
        <ToggleRow label="Age > 50 years" checked={a.ageOver50} onChange={set("ageOver50")} />
        <ToggleRow label="Neck circumference > 40 cm" checked={a.neckCircumferenceOver40cm} onChange={set("neckCircumferenceOver40cm")} />
        <ToggleRow label="Male gender" checked={a.maleGender} onChange={set("maleGender")} />
        <div className="pt-3">
          <ResultRow label={`Score ${score}/8`} value={risk} unit="risk" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChildPughCalculator() {
  const [pts, setPts] = React.useState({
    bilirubinPoints: 1 as 1 | 2 | 3,
    albuminPoints: 1 as 1 | 2 | 3,
    inrPoints: 1 as 1 | 2 | 3,
    ascitesPoints: 1 as 1 | 2 | 3,
    encephalopathyPoints: 1 as 1 | 2 | 3,
  });
  const { score, grade } = childPughScore(pts);

  const Row = ({
    label,
    field,
    options,
  }: {
    label: string;
    field: keyof typeof pts;
    options: [string, string, string];
  }) => (
    <div>
      <Label>{label}</Label>
      <Select value={String(pts[field])} onValueChange={(v) => setPts((p) => ({ ...p, [field]: Number(v) }))}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 — {options[0]}</SelectItem>
          <SelectItem value="2">2 — {options[1]}</SelectItem>
          <SelectItem value="3">3 — {options[2]}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card id="child-pugh">
      <CardHeader>
        <CardTitle>Child-Pugh score</CardTitle>
        <CardDescription>Hepatic reserve grading. Select the point value for each parameter.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label="Bilirubin" field="bilirubinPoints" options={["< 2 mg/dL", "2–3 mg/dL", "> 3 mg/dL"]} />
        <Row label="Albumin" field="albuminPoints" options={["> 3.5 g/dL", "2.8–3.5 g/dL", "< 2.8 g/dL"]} />
        <Row label="INR" field="inrPoints" options={["< 1.7", "1.7–2.3", "> 2.3"]} />
        <Row label="Ascites" field="ascitesPoints" options={["Absent", "Mild", "Moderate–severe"]} />
        <Row label="Encephalopathy" field="encephalopathyPoints" options={["None", "Grade I–II", "Grade III–IV"]} />
        <div className="pt-2">
          <ResultRow label={`Score ${score}/15`} value={`Class ${grade}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export function MeldCalculator() {
  const bilirubin = useNum(2);
  const inr = useNum(1.5);
  const creatinine = useNum(1.5);
  const score = meldScore(bilirubin.value, inr.value, creatinine.value);

  return (
    <Card id="meld">
      <CardHeader>
        <CardTitle>MELD score</CardTitle>
        <CardDescription>Original 3-variable formula (bilirubin, INR, creatinine).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Bilirubin (mg/dL)</Label><Input type="number" step="0.1" value={bilirubin.raw} onChange={(e) => bilirubin.setRaw(e.target.value)} /></div>
          <div><Label>INR</Label><Input type="number" step="0.1" value={inr.raw} onChange={(e) => inr.setRaw(e.target.value)} /></div>
          <div><Label>Creatinine (mg/dL)</Label><Input type="number" step="0.1" value={creatinine.raw} onChange={(e) => creatinine.setRaw(e.target.value)} /></div>
        </div>
        <ResultRow label="MELD score" value={score} />
      </CardContent>
    </Card>
  );
}

const NEWS2_OPTIONS = {
  respiratoryRate: [
    { label: "≤ 8 /min", points: 3 },
    { label: "9–11 /min", points: 1 },
    { label: "12–20 /min", points: 0 },
    { label: "21–24 /min", points: 2 },
    { label: "≥ 25 /min", points: 3 },
  ],
  spo2: [
    { label: "≤ 91%", points: 3 },
    { label: "92–93%", points: 2 },
    { label: "94–95%", points: 1 },
    { label: "≥ 96%", points: 0 },
  ],
  airOrOxygen: [
    { label: "Room air", points: 0 },
    { label: "Supplemental oxygen", points: 2 },
  ],
  systolicBp: [
    { label: "≤ 90 mmHg", points: 3 },
    { label: "91–100 mmHg", points: 2 },
    { label: "101–110 mmHg", points: 1 },
    { label: "111–219 mmHg", points: 0 },
    { label: "≥ 220 mmHg", points: 3 },
  ],
  pulse: [
    { label: "≤ 40 /min", points: 3 },
    { label: "41–50 /min", points: 1 },
    { label: "51–90 /min", points: 0 },
    { label: "91–110 /min", points: 1 },
    { label: "111–130 /min", points: 2 },
    { label: "≥ 131 /min", points: 3 },
  ],
  consciousness: [
    { label: "Alert", points: 0 },
    { label: "Confusion / Voice / Pain / Unresponsive", points: 3 },
  ],
  temperature: [
    { label: "≤ 35.0°C", points: 3 },
    { label: "35.1–36.0°C", points: 1 },
    { label: "36.1–38.0°C", points: 0 },
    { label: "38.1–39.0°C", points: 1 },
    { label: "≥ 39.1°C", points: 2 },
  ],
} as const;

export function News2Calculator() {
  const [sub, setSub] = React.useState<Record<keyof typeof NEWS2_OPTIONS, number>>({
    respiratoryRate: 0,
    spo2: 0,
    airOrOxygen: 0,
    systolicBp: 0,
    pulse: 0,
    consciousness: 0,
    temperature: 0,
  });
  const total = news2Total(sub);

  return (
    <Card id="news2">
      <CardHeader>
        <CardTitle>NEWS2 early warning score</CardTitle>
        <CardDescription>Standard (non-hypercapnic) SpO₂ scale shown. Verify against your ward&apos;s official NEWS2 chart, especially the hypercapnic SpO₂ scale for COPD/known CO₂ retainers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {(Object.keys(NEWS2_OPTIONS) as Array<keyof typeof NEWS2_OPTIONS>).map((key) => (
          <div key={key}>
            <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
            <Select value={String(sub[key])} onValueChange={(v) => setSub((s) => ({ ...s, [key]: Number(v) }))}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {NEWS2_OPTIONS[key].map((opt) => (
                  <SelectItem key={opt.label} value={String(opt.points)}>{opt.label} ({opt.points} pt)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="pt-2 flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">NEWS2 total</span>
          <div className="flex items-center gap-2">
            <span className="clinical-value text-sm font-semibold">{total}</span>
            <Badge variant={total >= 7 ? "critical" : total >= 5 ? "review" : "secondary"}>
              {total >= 7 ? "High risk" : total >= 5 ? "Medium risk" : "Low risk"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const SOFA_OPTIONS = {
  respiration: [
    { label: "PaO2/FiO2 ≥ 400", points: 0 },
    { label: "PaO2/FiO2 < 400", points: 1 },
    { label: "PaO2/FiO2 < 300", points: 2 },
    { label: "PaO2/FiO2 < 200, with respiratory support", points: 3 },
    { label: "PaO2/FiO2 < 100, with respiratory support", points: 4 },
  ],
  coagulation: [
    { label: "Platelets ≥ 150 ×10³/µL", points: 0 },
    { label: "Platelets < 150", points: 1 },
    { label: "Platelets < 100", points: 2 },
    { label: "Platelets < 50", points: 3 },
    { label: "Platelets < 20", points: 4 },
  ],
  liver: [
    { label: "Bilirubin < 1.2 mg/dL", points: 0 },
    { label: "Bilirubin 1.2–1.9 mg/dL", points: 1 },
    { label: "Bilirubin 2.0–5.9 mg/dL", points: 2 },
    { label: "Bilirubin 6.0–11.9 mg/dL", points: 3 },
    { label: "Bilirubin > 12.0 mg/dL", points: 4 },
  ],
  cardiovascular: [
    { label: "MAP ≥ 70 mmHg", points: 0 },
    { label: "MAP < 70 mmHg", points: 1 },
    { label: "Dopamine ≤ 5 or any-dose dobutamine", points: 2 },
    { label: "Dopamine > 5, or epinephrine ≤ 0.1, or norepinephrine ≤ 0.1 (mcg/kg/min)", points: 3 },
    { label: "Dopamine > 15, or epinephrine > 0.1, or norepinephrine > 0.1 (mcg/kg/min)", points: 4 },
  ],
  cns: [
    { label: "GCS 15", points: 0 },
    { label: "GCS 13–14", points: 1 },
    { label: "GCS 10–12", points: 2 },
    { label: "GCS 6–9", points: 3 },
    { label: "GCS < 6", points: 4 },
  ],
  renal: [
    { label: "Creatinine < 1.2 mg/dL", points: 0 },
    { label: "Creatinine 1.2–1.9 mg/dL", points: 1 },
    { label: "Creatinine 2.0–3.4 mg/dL", points: 2 },
    { label: "Creatinine 3.5–4.9 mg/dL, or urine output < 500 mL/day", points: 3 },
    { label: "Creatinine > 5.0 mg/dL, or urine output < 200 mL/day", points: 4 },
  ],
} as const;

const SOFA_LABELS: Record<keyof typeof SOFA_OPTIONS, string> = {
  respiration: "Respiration",
  coagulation: "Coagulation",
  liver: "Liver",
  cardiovascular: "Cardiovascular",
  cns: "CNS",
  renal: "Renal",
};

export function SofaCalculator() {
  const [sub, setSub] = React.useState<Record<keyof typeof SOFA_OPTIONS, number>>({
    respiration: 0,
    coagulation: 0,
    liver: 0,
    cardiovascular: 0,
    cns: 0,
    renal: 0,
  });
  const total = sofaTotal(sub);

  return (
    <Card id="sofa">
      <CardHeader>
        <CardTitle>SOFA score</CardTitle>
        <CardDescription>
          Sequential Organ Failure Assessment (Vincent et al. 1996). 6 organ systems, 0–4 points each, total 0–24.
          Select the band that matches the patient&apos;s worst value in the assessment period for each system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {(Object.keys(SOFA_OPTIONS) as Array<keyof typeof SOFA_OPTIONS>).map((key) => (
          <div key={key}>
            <Label>{SOFA_LABELS[key]}</Label>
            <Select value={String(sub[key])} onValueChange={(v) => setSub((s) => ({ ...s, [key]: Number(v) }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOFA_OPTIONS[key].map((opt) => (
                  <SelectItem key={opt.label} value={String(opt.points)}>{opt.points} — {opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="pt-2">
          <ResultRow label="SOFA total" value={total} unit="/ 24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function QsofaCalculator() {
  const [criteria, setCriteria] = React.useState({
    respiratoryRateOver22: false,
    systolicBpUnder100: false,
    alteredMentation: false,
  });
  const score = qsofaScore(criteria);
  const set = (k: keyof typeof criteria) => (v: boolean) => setCriteria((c) => ({ ...c, [k]: v }));

  return (
    <Card id="qsofa">
      <CardHeader>
        <CardTitle>qSOFA</CardTitle>
        <CardDescription>Bedside 3-criteria screen. ≥2 is associated with worse outcomes and should prompt full SOFA / sepsis workup — it is a screening flag, not a diagnosis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <ToggleRow label="Respiratory rate ≥ 22 /min" checked={criteria.respiratoryRateOver22} onChange={set("respiratoryRateOver22")} />
        <ToggleRow label="Systolic BP ≤ 100 mmHg" checked={criteria.systolicBpUnder100} onChange={set("systolicBpUnder100")} />
        <ToggleRow label="Altered mentation (GCS < 15)" checked={criteria.alteredMentation} onChange={set("alteredMentation")} />
        <div className="pt-3">
          <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
            <span className="text-sm text-muted-foreground">qSOFA score</span>
            <div className="flex items-center gap-2">
              <span className="clinical-value text-sm font-semibold">{score} / 3</span>
              {score >= 2 && <Badge variant="critical">High risk — consider sepsis</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ASA_CLASSES = [
  { grade: "I", desc: "A normal healthy patient" },
  { grade: "II", desc: "A patient with mild systemic disease" },
  { grade: "III", desc: "A patient with severe systemic disease" },
  { grade: "IV", desc: "A patient with severe systemic disease that is a constant threat to life" },
  { grade: "V", desc: "A moribund patient who is not expected to survive without the operation" },
  { grade: "VI", desc: "A declared brain-dead patient whose organs are being removed for donor purposes" },
];

export function AsaPsReference() {
  return (
    <Card id="asa-ps">
      <CardHeader>
        <CardTitle>ASA Physical Status Classification</CardTitle>
        <CardDescription>Reference only — clinical judgement, not a calculator. Add &quot;E&quot; suffix for emergency surgery.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {ASA_CLASSES.map((c) => (
          <div key={c.grade} className="flex items-start gap-3 rounded-md bg-secondary/50 px-3 py-2">
            <Badge className="mt-0.5 shrink-0">{c.grade}</Badge>
            <p className="text-sm">{c.desc}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
