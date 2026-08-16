"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { EttSizingCalculator, LmaSizingReference } from "@/components/calculators/airway-calculators";

const MALLAMPATI = [
  { grade: "I", desc: "Soft palate, uvula, fauces, and pillars all visible" },
  { grade: "II", desc: "Soft palate, uvula, and fauces visible; pillars not visible" },
  { grade: "III", desc: "Soft palate and base of uvula visible only" },
  { grade: "IV", desc: "Soft palate not visible at all" },
];

const LEMON = [
  { letter: "L", meaning: "Look externally", detail: "Facial trauma, large incisors, beard/moustache, large tongue" },
  { letter: "E", meaning: "Evaluate 3-3-2", detail: "Mouth opening ~3 fingers, mentum-hyoid distance ~3 fingers, hyoid-thyroid notch ~2 fingers" },
  { letter: "M", meaning: "Mallampati", detail: "Class III–IV predicts a harder view" },
  { letter: "O", meaning: "Obstruction", detail: "Any condition that could cause difficulty with laryngoscopy (epiglottitis, abscess, trauma)" },
  { letter: "N", meaning: "Neck mobility", detail: "Reduced flexion/extension (e.g. cervical collar, ankylosing spondylitis) predicts difficulty" },
];

const MOANS = [
  { letter: "M", meaning: "Mask seal", detail: "Beard, facial deformity, blood/secretions" },
  { letter: "O", meaning: "Obesity / Obstruction", detail: "BMI, OSA, upper airway obstruction" },
  { letter: "A", meaning: "Age", detail: "Older age associated with harder mask ventilation" },
  { letter: "N", meaning: "No teeth", detail: "Edentulous patients can be harder to mask-ventilate" },
  { letter: "S", meaning: "Stiff lungs / Snoring", detail: "Reduced compliance, history of snoring/OSA" },
];

const RODS = [
  { letter: "R", meaning: "Restricted mouth opening", detail: "May prevent adequate device insertion" },
  { letter: "O", meaning: "Obstruction", detail: "Upper airway pathology limiting seal/insertion" },
  { letter: "D", meaning: "Disrupted or distorted airway", detail: "Anatomy altered by trauma, surgery, or radiation" },
  { letter: "S", meaning: "Stiff lungs/cervical spine", detail: "Reduced compliance or limited positioning" },
];

function MnemonicCard({ title, subtitle, rows }: { title: string; subtitle: string; rows: { letter: string; meaning: string; detail: string }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r) => (
          <div key={r.letter} className="flex items-start gap-3 rounded-md bg-secondary/50 px-3 py-2">
            <span className="clinical-value text-lg font-bold text-primary w-6 shrink-0">{r.letter}</span>
            <div>
              <p className="text-sm font-medium">{r.meaning}</p>
              <p className="text-xs text-muted-foreground">{r.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AirwayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Airway</h1>
        <p className="text-muted-foreground text-sm mt-1">Assessment mnemonics, classifications, and sizing reference.</p>
      </div>

      <DisclaimerBanner compact />

      <Card id="mallampati">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Mallampati classification</CardTitle>
            <CardDescription>Assessed with the patient seated, mouth open, tongue protruded, phonating.</CardDescription>
          </div>
          <VerificationBadge status="unverified-ai-seed" />
        </CardHeader>
        <CardContent className="space-y-2">
          {MALLAMPATI.map((m) => (
            <div key={m.grade} className="flex items-start gap-3 rounded-md bg-secondary/50 px-3 py-2">
              <Badge className="mt-0.5 shrink-0">{m.grade}</Badge>
              <p className="text-sm">{m.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div id="lemon">
        <MnemonicCard title="LEMON — predicting difficult laryngoscopy" subtitle="A structured bedside difficult-airway screen." rows={LEMON} />
      </div>
      <MnemonicCard title="MOANS — predicting difficult mask ventilation" subtitle="Screen before you induce, not after." rows={MOANS} />
      <MnemonicCard title="RODS — predicting difficult extraglottic device use" subtitle="Relevant when an LMA/SGA is part of the plan." rows={RODS} />

      <EttSizingCalculator />
      <LmaSizingReference />
    </div>
  );
}
