"use client";

import * as React from "react";
import Link from "next/link";
import { Siren, Pill, Calculator, Activity, Star, Clock, Stethoscope, GitCompareArrows } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllDrugs, getAllCrisisAlgorithms, getAllProtocols } from "@/lib/data";
import { getFavorites, getRecent, getCases } from "@/lib/db";
import { CALCULATOR_REGISTRY } from "@/lib/calculator-registry";
import type { Drug, CrisisAlgorithm, Protocol, FavoriteRecord, CaseRecord } from "@/lib/types";

const CRISIS_ICON = Siren;

function labelForRecent(kind: string, refId: string, drugs: Drug[]): string {
  if (kind === "drug") return drugs.find((d) => d.id === refId)?.genericName ?? refId;
  const calc = CALCULATOR_REGISTRY.find((c) => c.id === refId);
  if (kind === "calculator" && calc) return calc.title;
  return refId;
}

export default function DashboardPage() {
  const [crises, setCrises] = React.useState<CrisisAlgorithm[]>([]);
  const [favs, setFavs] = React.useState<FavoriteRecord[]>([]);
  const [recent, setRecent] = React.useState<Array<{ kind: string; refId: string }>>([]);
  const [cases, setCases] = React.useState<CaseRecord[]>([]);
  const [drugs, setDrugs] = React.useState<Drug[]>([]);
  const [protocols, setProtocols] = React.useState<Protocol[]>([]);

  React.useEffect(() => {
    Promise.all([
      getAllCrisisAlgorithms(),
      getAllDrugs(),
      getAllProtocols(),
      getFavorites(),
      getRecent(),
      getCases(),
    ]).then(([c, d, p, f, r, cs]) => {
      setCrises(c); setDrugs(d); setProtocols(p); setFavs(f); setRecent(r); setCases(cs);
    });
  }, []);

  const quickCrisis = crises.slice(0, 6);
  const recentDrugs = recent.filter((r) => r.kind === "drug").slice(0, 5);
  const recentCalcs = recent.filter((r) => r.kind === "calculator").slice(0, 4);
  const topProtocols = protocols.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">OT Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Rapid case support — everything you need in 5–10 seconds.</p>
        </div>
        <Link href="/case">
          <Button className="gap-1.5"><Stethoscope className="h-4 w-4" /> Case mode</Button>
        </Link>
      </div>

      {/* Emergency shortcuts */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2 text-critical">
          <Siren className="h-4 w-4" /> Emergency
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickCrisis.map((c) => (
            <Link key={c.id} href={`/crisis#${c.id}`}>
              <div className="flex items-center gap-2 rounded-lg border border-critical/20 bg-critical/5 px-3 py-3 hover:border-critical/50 transition-colors">
                <CRISIS_ICON className="h-4 w-4 text-critical shrink-0" />
                <span className="text-sm font-medium leading-tight">{c.title}</span>
              </div>
            </Link>
          ))}
          {quickCrisis.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No emergency algorithms loaded.</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Tap the red <span className="font-medium">Emergency</span> button (bottom-right, any screen) for full step-by-step algorithms with timers.</p>
      </section>

      {/* Current case banner */}
      {cases[0] && (
        <Link href="/case">
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <Activity className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current case</p>
              <p className="font-medium truncate">{cases[0].label ?? `${cases[0].input.ageYears}${cases[0].input.sex === "male" ? "M" : "F"} · ${cases[0].input.asa}`}</p>
            </div>
            <span className="text-xs text-muted-foreground">Open →</span>
          </div>
        </Link>
      )}

      {/* Favorites */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Favorites</h2>
        {favs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tap the star on any drug or item to pin it here.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {favs.map((f) => {
              const href = f.kind === "drug" ? `/drugs#${f.refId}` : f.kind === "calculator" ? `/calculators#${f.refId}` : f.kind === "crisis" ? `/crisis#${f.refId}` : f.kind === "protocol" || f.kind === "checklist" ? `/checklists#${f.refId}` : "/";
              const name = labelForRecent(f.kind, f.refId, drugs);
              return (
                <Link key={f.id} href={href}>
                  <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2.5 hover:bg-secondary transition-colors">
                    <span className="text-sm flex-1 truncate">{name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.kind}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent drugs */}
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /> Recent drugs</h2>
          {recentDrugs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Opening a drug logs it here.</p>
          ) : (
            <div className="space-y-2">
              {recentDrugs.map((r, i) => (
                <Link key={`${r.refId}-${i}`} href={`/drugs#${r.refId}`}>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 hover:bg-secondary transition-colors">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm flex-1">{labelForRecent(r.kind, r.refId, drugs)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link href="/drugs"><Button variant="outline" size="sm" className="w-full">All drugs →</Button></Link>
        </section>

        {/* Recent calculators */}
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Recent calculators</h2>
          {recentCalcs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Recent calculator use logs here.</p>
          ) : (
            <div className="space-y-2">
              {recentCalcs.map((r, i) => {
                const calc = CALCULATOR_REGISTRY.find((c) => c.id === r.refId);
                return (
                  <Link key={`${r.refId}-${i}`} href={`/calculators#${r.refId}`}>
                    <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 hover:bg-secondary transition-colors">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm flex-1">{calc?.title ?? r.refId}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <Link href="/calculators"><Button variant="outline" size="sm" className="w-full">All calculators →</Button></Link>
        </section>
      </div>

      {/* Today's protocols */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Today&apos;s protocols</h2>
        {topProtocols.length === 0 ? (
          <p className="text-sm text-muted-foreground">No protocols loaded yet.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-2">
            {topProtocols.map((p) => (
              <Link key={p.id} href={`/checklists#${p.id}`}>
                <div className="rounded-md border border-border bg-secondary/40 px-3 py-2.5 hover:bg-secondary transition-colors">
                  <span className="text-sm font-medium">{p.title}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
