"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { ProtocolCard } from "@/components/shared/protocol-card";
import { InteractiveChecklist } from "@/components/shared/interactive-checklist";
import { AlgorithmStepper } from "@/components/crisis/algorithm-stepper";
import {
  LungProtectiveTvCalculator,
  PfRatioCalculator,
  SfRatioCalculator,
  OxygenationIndexCalculator,
  DrivingPressureCalculator,
  MinuteVentilationCalculator,
  CrrtDoseCalculator,
  NorepiEquivalentCalculator,
} from "@/components/calculators/icu-calculators";
import { SofaCalculator, QsofaCalculator } from "@/components/calculators/risk-score-calculators";
import { getAllProtocols, getAllChecklists, getAllCrisisAlgorithms } from "@/lib/data";
import type { Protocol, Checklist, CrisisAlgorithm } from "@/lib/types";

const VENT_PROTOCOL_IDS = ["lung-protective-ventilation", "sbt-weaning", "vap-prevention-bundle"];
const SEPSIS_CRISIS_IDS = ["septic-shock-resuscitation"];
const SEPSIS_CHECKLIST_IDS = ["sepsis-hour1-bundle"];
const VENT_CRISIS_IDS = ["ventilator-high-pressure"];
const RRT_PROTOCOL_IDS = ["crrt-initiation"];
const RRT_CHECKLIST_IDS = ["crrt-circuit-setup"];
const SEDATION_PROTOCOL_IDS = ["icu-sedation-analgesia"];
const ROUNDS_CHECKLIST_IDS = ["fasthug-daily-rounds"];

const VENT_MODES = [
  { mode: "VCV (Volume Control)", detail: "Set tidal volume + rate + flow; pressure varies with compliance/resistance. Guarantees minute ventilation, doesn't guarantee pressure." },
  { mode: "PCV (Pressure Control)", detail: "Set inspiratory pressure + rate + I:E; tidal volume varies with compliance/resistance. Guarantees pressure limit, doesn't guarantee volume." },
  { mode: "PRVC / VC+ (Pressure-Regulated Volume Control)", detail: "Hybrid — targets a set tidal volume using the lowest possible pressure, breath-to-breath auto-adjusted. Vendor names vary (AutoFlow, VC+, PRVC)." },
  { mode: "SIMV (Synchronized Intermittent Mandatory Ventilation)", detail: "Delivers a set number of mandatory breaths synchronized to patient effort; patient can breathe spontaneously between them, often with pressure support." },
  { mode: "PSV (Pressure Support Ventilation)", detail: "Patient-triggered, pressure-limited, flow-cycled — every breath is patient-initiated. Common weaning mode; requires adequate respiratory drive." },
  { mode: "CPAP / PEEP-only", detail: "Continuous positive pressure with no mandatory breaths or pressure support above PEEP — used for SBTs and stable spontaneously-breathing patients." },
];

const RASS_SCALE = [
  { score: "+4", label: "Combative", detail: "Overtly combative, violent, immediate danger to staff" },
  { score: "+3", label: "Very agitated", detail: "Pulls/removes tubes or catheters, aggressive" },
  { score: "+2", label: "Agitated", detail: "Frequent non-purposeful movement, fights ventilator" },
  { score: "+1", label: "Restless", detail: "Anxious, apprehensive, movements not aggressive" },
  { score: "0", label: "Alert and calm", detail: "Target for most patients without a specific deep-sedation indication" },
  { score: "−1", label: "Drowsy", detail: "Not fully alert, sustained awakening (eye opening/contact) to voice ≥10s" },
  { score: "−2", label: "Light sedation", detail: "Briefly awakens with eye contact to voice <10s" },
  { score: "−3", label: "Moderate sedation", detail: "Movement or eye opening to voice, no eye contact" },
  { score: "−4", label: "Deep sedation", detail: "No response to voice; movement or eye opening to physical stimulation" },
  { score: "−5", label: "Unarousable", detail: "No response to voice or physical stimulation" },
];

export default function IcuPage() {
  const [protocols, setProtocols] = React.useState<Protocol[]>([]);
  const [checklists, setChecklists] = React.useState<Checklist[]>([]);
  const [crisis, setCrisis] = React.useState<CrisisAlgorithm[]>([]);
  const [activeCrisis, setActiveCrisis] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAllProtocols().then(setProtocols);
    getAllChecklists().then(setChecklists);
    getAllCrisisAlgorithms().then(setCrisis);
  }, []);

  const byId = (ids: string[], list: { id: string }[]) => ids.map((id) => list.find((x) => x.id === id)).filter(Boolean);

  const activeAlgorithm = crisis.find((c) => c.id === activeCrisis);

  if (activeAlgorithm) {
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveCrisis(null)} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to ICU
        </button>
        <AlgorithmStepper algorithm={activeAlgorithm} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">ICU</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ventilation, sepsis resuscitation, renal replacement therapy, and sedation/delirium management —
          protocols, checklists, crisis algorithms, and calculators in one place.
        </p>
      </div>

      <DisclaimerBanner compact />

      <Tabs defaultValue="ventilation">
        <TabsList>
          <TabsTrigger value="ventilation">Ventilation</TabsTrigger>
          <TabsTrigger value="sepsis">Sepsis</TabsTrigger>
          <TabsTrigger value="rrt">RRT</TabsTrigger>
          <TabsTrigger value="sedation">Sedation & Scoring</TabsTrigger>
        </TabsList>

        <TabsContent value="ventilation" className="space-y-4">
          {(byId(VENT_CRISIS_IDS, crisis) as CrisisAlgorithm[]).map((c) => (
            <Card key={c.id} className="cursor-pointer border-critical/20 hover:border-critical/50 transition-colors" onClick={() => setActiveCrisis(c.id)}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription>{c.triggerCriteria}</CardDescription>
                </div>
                <Badge variant="critical">Crisis algorithm</Badge>
              </CardHeader>
            </Card>
          ))}

          <LungProtectiveTvCalculator />
          <PfRatioCalculator />
          <SfRatioCalculator />
          <OxygenationIndexCalculator />
          <DrivingPressureCalculator />
          <MinuteVentilationCalculator />

          <Card id="vent-modes">
            <CardHeader>
              <CardTitle>Ventilator modes — quick reference</CardTitle>
              <CardDescription>Common modes and what each one guarantees vs. lets vary. Exact vendor naming differs by machine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {VENT_MODES.map((v) => (
                <div key={v.mode} className="rounded-md bg-secondary/50 px-3 py-2">
                  <p className="text-sm font-medium">{v.mode}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {(byId(VENT_PROTOCOL_IDS, protocols) as Protocol[]).map((p) => (
            <ProtocolCard key={p.id} protocol={p} />
          ))}
        </TabsContent>

        <TabsContent value="sepsis" className="space-y-4">
          {(byId(SEPSIS_CRISIS_IDS, crisis) as CrisisAlgorithm[]).map((c) => (
            <Card key={c.id} className="cursor-pointer border-critical/20 hover:border-critical/50 transition-colors" onClick={() => setActiveCrisis(c.id)}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription>{c.triggerCriteria}</CardDescription>
                </div>
                <Badge variant="critical">Crisis algorithm</Badge>
              </CardHeader>
            </Card>
          ))}

          <QsofaCalculator />
          <SofaCalculator />
          <NorepiEquivalentCalculator />

          {(byId(SEPSIS_CHECKLIST_IDS, checklists) as Checklist[]).map((c) => (
            <InteractiveChecklist key={c.id} checklist={c} />
          ))}
        </TabsContent>

        <TabsContent value="rrt" className="space-y-4">
          <CrrtDoseCalculator />
          {(byId(RRT_PROTOCOL_IDS, protocols) as Protocol[]).map((p) => (
            <ProtocolCard key={p.id} protocol={p} />
          ))}
          {(byId(RRT_CHECKLIST_IDS, checklists) as Checklist[]).map((c) => (
            <InteractiveChecklist key={c.id} checklist={c} />
          ))}
        </TabsContent>

        <TabsContent value="sedation" className="space-y-4">
          <Card id="rass">
            <CardHeader>
              <CardTitle>RASS — Richmond Agitation-Sedation Scale</CardTitle>
              <CardDescription>Target for most ICU patients without a specific deep-sedation indication: 0 to −2.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {RASS_SCALE.map((r) => (
                <div key={r.score} className="flex items-start gap-3 rounded-md bg-secondary/50 px-3 py-2">
                  <span className="clinical-value text-sm font-bold text-primary w-8 shrink-0">{r.score}</span>
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {(byId(SEDATION_PROTOCOL_IDS, protocols) as Protocol[]).map((p) => (
            <ProtocolCard key={p.id} protocol={p} />
          ))}

          {(byId(ROUNDS_CHECKLIST_IDS, checklists) as Checklist[]).map((c) => (
            <InteractiveChecklist key={c.id} checklist={c} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
