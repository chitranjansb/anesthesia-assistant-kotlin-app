"use client";

import * as React from "react";
import Link from "next/link";
import { Stethoscope, Save, Trash2, Pill, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { generateCasePlan } from "@/lib/case-engine";
import { saveCase, getCases, deleteCase } from "@/lib/db";
import type { CaseInput, CaseRecord, CasePlanRow, AsaStatus, Sex } from "@/lib/types";

const COMORBIDITY_OPTIONS = [
  "pregnancy", "renal-failure", "ckd", "hepatic-failure", "cirrhosis",
  "copd", "asthma", "bronchospasm", "diabetes", "hypertension",
  "cardiac", "obesity", "neck", "bleeding-disorder",
];

const ASA_OPTIONS: AsaStatus[] = ["I", "II", "III", "IV", "V", "VI", "E"];

export default function CasePage() {
  const [age, setAge] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [sex, setSex] = React.useState<Sex>("male");
  const [asa, setAsa] = React.useState<AsaStatus>("II");
  const [surgery, setSurgery] = React.useState("");
  const [comorbidities, setComorbidities] = React.useState<string[]>([]);
  const [plan, setPlan] = React.useState<CasePlanRow[] | null>(null);
  const [savedCases, setSavedCases] = React.useState<CaseRecord[]>([]);
  const [label, setLabel] = React.useState("");

  React.useEffect(() => { getCases().then(setSavedCases); }, []);

  function toggleComorbidity(c: string) {
    setComorbidities((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function build(): CasePlanRow[] {
    const input: CaseInput = {
      ageYears: parseFloat(age) || 0,
      weightKg: parseFloat(weight) || 0,
      sex,
      asa,
      surgery,
      comorbidities,
    };
    return generateCasePlan(input);
  }

  function handleGenerate() {
    setPlan(build());
  }

  async function handleSave() {
    if (!plan) return;
    const input: CaseInput = {
      ageYears: parseFloat(age) || 0,
      weightKg: parseFloat(weight) || 0,
      sex, asa, surgery, comorbidities,
    };
    const rec: CaseRecord = {
      id: `case-${Date.now()}`,
      input,
      plan,
      createdAt: Date.now(),
      label: label.trim() || `${age}${sex === "male" ? "M" : "F"} · ${asa} · ${surgery || "case"}`,
    };
    await saveCase(rec);
    setSavedCases((prev) => [rec, ...prev].slice(0, 20));
  }

  async function handleDelete(id: string) {
    await deleteCase(id);
    setSavedCases((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" /> Patient Case Mode
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Enter the patient and get a heuristic plan in seconds.</p>
      </div>

      <DisclaimerBanner compact />

      <Card>
        <CardHeader><CardTitle>Patient</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Age (yr)</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="45" />
            </div>
            <div>
              <Label className="text-xs">Weight (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
            </div>
            <div>
              <Label className="text-xs">Sex</Label>
              <select value={sex} onChange={(e) => setSex(e.target.value as Sex)} className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">ASA</Label>
              <select value={asa} onChange={(e) => setAsa(e.target.value as AsaStatus)} className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                {ASA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Surgery / procedure</Label>
            <Input value={surgery} onChange={(e) => setSurgery(e.target.value)} placeholder="e.g. Laparoscopic cholecystectomy" />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Comorbidities / flags</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMORBIDITY_OPTIONS.map((c) => (
                <button key={c} onClick={() => toggleComorbidity(c)}>
                  <Badge variant={comorbidities.includes(c) ? "default" : "outline"} className="capitalize cursor-pointer">{c.replace("-", " ")}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" className="max-w-xs" />
            <Button onClick={handleGenerate} className="gap-1.5"><ArrowRight className="h-4 w-4" /> Generate plan</Button>
            {plan && <Button variant="outline" onClick={handleSave} className="gap-1.5"><Save className="h-4 w-4" /> Save case</Button>}
          </div>
        </CardContent>
      </Card>

      {plan && (
        <Card>
          <CardHeader><CardTitle>Suggested plan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {plan.map((row, i) => (
              <div key={i} className="rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{row.section}</p>
                </div>
                <p className="text-sm mt-1">{row.text}</p>
                {row.rationale && <p className="text-xs text-muted-foreground mt-1">{row.rationale}</p>}
                {row.drugIds && row.drugIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {row.drugIds.map((id) => (
                      <Link key={id} href={`/drugs#${id}`}>
                        <Badge variant="secondary" className="gap-1 cursor-pointer"><Pill className="h-3 w-3" /> {id}</Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Advisory only — reconcile with the patient, institutional protocol, and a supervising clinician. Drug monographs are tagged needs-review.</p>
          </CardContent>
        </Card>
      )}

      {savedCases.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Saved cases</h2>
          <div className="space-y-2">
            {savedCases.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.label ?? `${c.input.ageYears}${c.input.sex === "male" ? "M" : "F"} · ${c.input.asa}`}</p>
                  <p className="text-xs text-muted-foreground">{c.input.comorbidities.join(", ") || "no flags"}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} aria-label="Delete case"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
