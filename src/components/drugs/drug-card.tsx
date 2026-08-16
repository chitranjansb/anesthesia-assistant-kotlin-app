"use client";

import * as React from "react";
import Link from "next/link";
import { Star, ChevronDown, Baby, HeartPulse, Droplets, Zap, GitCompareArrows, Pill } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { SourceCitation } from "@/components/shared/source-citation";
import { DrugClassBadge } from "@/components/shared/drug-class-badge";
import { QuickCalcDrawer } from "./quick-calc-drawer";
import { toggleFavorite, isFavorite, addRecent } from "@/lib/db";
import { useLogRecent } from "@/lib/use-log-recent";
import type { Drug } from "@/lib/types";
import { cn } from "@/lib/utils";

const DOSE_ROWS: Array<{ key: keyof Drug["doses"]; label: string }> = [
  { key: "adult", label: "Adult" },
  { key: "pediatric", label: "Pediatric" },
  { key: "geriatric", label: "Geriatric" },
  { key: "obese", label: "Obese" },
  { key: "renalAdjustment", label: "Renal adjustment" },
  { key: "hepaticAdjustment", label: "Hepatic adjustment" },
  { key: "infusion", label: "Infusion" },
  { key: "emergency", label: "Emergency" },
  { key: "maximum", label: "Maximum" },
];

// Compare set stored in sessionStorage so it survives navigation within a session.
const COMPARE_KEY = "ara-compare";
function getCompare(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(sessionStorage.getItem(COMPARE_KEY) ?? "[]"); } catch { return []; }
}
function setCompare(ids: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
}

export function DrugCard({ drug, defaultOpen = false }: { drug: Drug; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [fav, setFav] = React.useState(false);
  const [inCompare, setInCompare] = React.useState(false);

  React.useEffect(() => {
    isFavorite(`drug:${drug.id}`).then(setFav).catch(() => {});
    setInCompare(getCompare().includes(drug.id));
  }, [drug.id]);

  async function handleFav(e: React.MouseEvent) {
    e.stopPropagation();
    const nowFav = await toggleFavorite({ id: `drug:${drug.id}`, kind: "drug", refId: drug.id, createdAt: Date.now() });
    setFav(nowFav);
  }

  function handleCompare(e: React.MouseEvent) {
    e.stopPropagation();
    const cur = getCompare();
    const next = cur.includes(drug.id) ? cur.filter((x) => x !== drug.id) : [...cur, drug.id].slice(-3);
    setCompare(next);
    setInCompare(next.includes(drug.id));
  }

  const pregnancyIcon =
    drug.pregnancyCategory === "avoid"
      ? <span className="text-rose-600" title="Avoid in pregnancy">⚠</span>
      : drug.pregnancyCategory === "caution"
      ? <Baby className="h-3.5 w-3.5 text-amber-600" />
      : drug.pregnancyCategory === "safe"
      ? <Baby className="h-3.5 w-3.5 text-emerald-600" />
      : null;

  const hasRenal = !!drug.doses.renalAdjustment;
  const hasHepatic = !!drug.doses.hepaticAdjustment;
  const isEmergency = drug.tags.includes("emergency") || drug.tags.includes("RSI") || drug.tags.includes("ACLS");
  const isRsi = !!drug.rsi;

  return (
    <Card id={drug.id} className="scroll-mt-20">
      <CardHeader
        className="cursor-pointer flex-row items-start justify-between gap-3 space-y-0"
        onClick={() => { setOpen((o) => { const next = !o; if (next) addRecent("drug", drug.id).catch(() => {}); return next; }); }}
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="truncate">{drug.genericName}</CardTitle>
            <VerificationBadge status={drug.verificationStatus} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DrugClassBadge drugClass={drug.drugClass} color={drug.classColor} />
            <div className="flex flex-wrap gap-1.5">
              {drug.tags.slice(0, 5).map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            {pregnancyIcon && <span className="flex items-center gap-1 text-xs">{pregnancyIcon} Pregnancy</span>}
            {hasRenal && <span className="flex items-center gap-1 text-xs"><Droplets className="h-3.5 w-3.5 text-sky-600" /> Renal adj.</span>}
            {hasHepatic && <span className="flex items-center gap-1 text-xs"><Droplets className="h-3.5 w-3.5 text-teal-600" /> Hepatic adj.</span>}
            {isRsi && <span className="flex items-center gap-1 text-xs"><Zap className="h-3.5 w-3.5 text-orange-600" /> RSI</span>}
            {isEmergency && <span className="flex items-center gap-1 text-xs"><HeartPulse className="h-3.5 w-3.5 text-rose-600" /> Emergency</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={handleCompare} aria-label="Add to compare" className={cn(inCompare && "text-primary")}>
            <GitCompareArrows className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFav} aria-label="Toggle favorite">
            <Star className={cn("h-4 w-4", fav && "fill-primary text-primary")} />
          </Button>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-5 border-t border-border/60 pt-5">
          <div className="flex flex-wrap gap-2">
            <Link href={`/compare?ids=${getCompare().concat(drug.id).join(",")}`} onClick={(e) => { const c = getCompare(); if (!c.includes(drug.id)) { setCompare(c.concat(drug.id)); } }}>
              <Button variant="outline" size="sm" className={cn(inCompare && "border-primary text-primary")}>
                <GitCompareArrows className="h-4 w-4" /> {inCompare ? "In compare" : "Compare"}
              </Button>
            </Link>
            <QuickCalcDrawer />
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Brand examples (India)</h4>
            <p className="text-sm">{drug.brandExamplesIndia.join(", ") || "—"}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Mechanism</h4>
            <p className="text-sm">{drug.mechanism}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(drug.pharmacokinetics).map(([k, v]) =>
              v ? (
                <div key={k}>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
                  <p className="clinical-value text-sm">{v}</p>
                </div>
              ) : null
            )}
          </div>

          {(drug.rsi || drug.pediatricRsi) && (
            <div className="rounded-md bg-orange-500/10 border border-orange-500/30 px-3 py-2 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">Rapid sequence induction</p>
              {drug.rsi && <p className="text-sm"><span className="text-muted-foreground">Adult: </span><span className="clinical-value font-medium">{drug.rsi.value}</span></p>}
              {drug.pediatricRsi && <p className="text-sm"><span className="text-muted-foreground">Pediatric: </span><span className="clinical-value font-medium">{drug.pediatricRsi.value}</span></p>}
            </div>
          )}

          {drug.infusionPrep && (
            <div className="rounded-md bg-secondary/60 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Infusion prep</p>
              <p className="clinical-value text-sm font-medium">{drug.infusionPrep}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dosing</h4>
            <div className="space-y-2">
              {DOSE_ROWS.map(({ key, label }) => {
                const dose = drug.doses[key];
                if (!dose) return null;
                return (
                  <div key={key} className="rounded-md bg-secondary/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{label} — {dose.label}</p>
                    <p className="clinical-value text-sm font-medium">{dose.value}</p>
                    {dose.notes && <p className="text-xs text-muted-foreground mt-0.5">{dose.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {drug.fluidCompatibility && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">IV fluid / compatibility</h4>
              <p className="text-sm">{drug.fluidCompatibility}</p>
            </div>
          )}

          {(drug.pregnancy || drug.lactation) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {drug.pregnancy && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Pregnancy</h4>
                  <p className="text-sm">{drug.pregnancy}</p>
                </div>
              )}
              {drug.lactation && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Lactation</h4>
                  <p className="text-sm">{drug.lactation}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Contraindications</h4>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {drug.contraindications.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Side effects</h4>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {drug.sideEffects.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Interactions</h4>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {drug.interactions.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Monitoring</h4>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {drug.monitoring.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          {drug.overdoseManagement && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Overdose management</h4>
              <p className="text-sm">{drug.overdoseManagement}</p>
            </div>
          )}

          {drug.quickTips && drug.quickTips.length > 0 && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Quick tips</h4>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {drug.quickTips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}

          <SourceCitation source={drug.source} />
        </CardContent>
      )}
    </Card>
  );
}
