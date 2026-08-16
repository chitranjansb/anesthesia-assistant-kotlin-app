"use client";

import * as React from "react";
import Link from "next/link";
import { GitCompareArrows, X, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { DrugClassBadge } from "@/components/shared/drug-class-badge";
import { getAllDrugs } from "@/lib/data";
import type { Drug } from "@/lib/types";

const COMPARE_KEY = "ara-compare";
function getCompare(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(sessionStorage.getItem(COMPARE_KEY) ?? "[]"); } catch { return []; }
}
function setCompare(ids: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
}

function dose(d: Drug, key: keyof Drug["doses"]): string {
  return d.doses[key]?.value ?? "—";
}

export default function ComparePage() {
  const [drugs, setDrugs] = React.useState<Drug[]>([]);
  const [ids, setIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("ids")?.split(",").filter(Boolean) ?? [];
    const list = fromUrl.length ? fromUrl : getCompare();
    setIds(list);
    getAllDrugs().then((all) => {
      const map = new Map(all.map((d) => [d.id, d]));
      setDrugs(list.map((id) => map.get(id)).filter(Boolean) as Drug[]);
    });
  }, []);

  function remove(id: string) {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    setCompare(next);
    setDrugs((ds) => ds.filter((d) => d.id !== id));
  }

  const rows: Array<{ label: string; render: (d: Drug) => React.ReactNode }> = [
    { label: "Class", render: (d) => <DrugClassBadge drugClass={d.drugClass} color={d.classColor} /> },
    { label: "Onset", render: (d) => d.pharmacokinetics.onset ?? "—" },
    { label: "Duration", render: (d) => d.pharmacokinetics.duration ?? "—" },
    { label: "Adult dose", render: (d) => dose(d, "adult") },
    { label: "RSI", render: (d) => d.rsi?.value ?? "—" },
    { label: "Infusion", render: (d) => d.doses.infusion?.value ?? "—" },
    { label: "Max dose", render: (d) => d.doses.maximum?.value ?? "—" },
    { label: "Contraindications", render: (d) => <span className="text-xs">{d.contraindications.join("; ") || "—"}</span> },
    { label: "Key advantage", render: (d) => <span className="text-xs">{d.quickTips?.[0] ?? "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/drugs">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-primary" /> Compare drugs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Side-by-side monographs (up to 3). Tap “Compare” on any drug card.</p>
        </div>
      </div>

      {drugs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No drugs selected. Open a drug and tap the <GitCompareArrows className="inline h-3.5 w-3.5" /> compare icon.
          </CardContent>
        </Card>
      )}

      {drugs.length > 0 && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left p-3 text-xs uppercase tracking-wide text-muted-foreground w-40">Attribute</th>
                  {drugs.map((d) => (
                    <th key={d.id} className="text-left p-3 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{d.genericName}</span>
                            <VerificationBadge status={d.verificationStatus} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{d.drugClass}</p>
                        </div>
                        <button onClick={() => remove(d.id)} aria-label="Remove" className="text-muted-foreground hover:text-critical">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/40 last:border-0">
                    <td className="p-3 text-xs uppercase tracking-wide text-muted-foreground align-top">{row.label}</td>
                    {drugs.map((d) => (
                      <td key={d.id} className="p-3 align-top clinical-value">{row.render(d)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
