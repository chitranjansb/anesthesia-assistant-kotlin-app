"use client";

import * as React from "react";
import { Siren } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { AlgorithmStepper } from "@/components/crisis/algorithm-stepper";
import { getAllCrisisAlgorithms } from "@/lib/data";
import type { CrisisAlgorithm } from "@/lib/types";

export default function CrisisPage() {
  const [algorithms, setAlgorithms] = React.useState<CrisisAlgorithm[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAllCrisisAlgorithms().then((data) => {
      setAlgorithms(data);
      const hash = window.location.hash.replace("#", "");
      if (hash && data.some((a) => a.id === hash)) setSelected(hash);
    });
  }, []);

  const active = algorithms.find((a) => a.id === selected);

  if (active) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground hover:text-foreground">
          ← All crisis algorithms
        </button>
        <AlgorithmStepper algorithm={active} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Crisis Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Step-by-step emergency algorithms with built-in timers and checklists.
        </p>
      </div>

      <DisclaimerBanner />

      <div className="grid sm:grid-cols-2 gap-4">
        {algorithms.map((a) => (
          <Card
            key={a.id}
            id={a.id}
            className="cursor-pointer border-critical/20 hover:border-critical/50 transition-colors"
            onClick={() => setSelected(a.id)}
          >
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-critical/10 text-critical shrink-0">
                <Siren className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                </div>
                <CardDescription>{a.triggerCriteria}</CardDescription>
                <VerificationBadge status={a.verificationStatus} />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
