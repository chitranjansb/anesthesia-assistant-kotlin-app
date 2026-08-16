"use client";

import * as React from "react";
import { Siren, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { AlgorithmStepper } from "@/components/crisis/algorithm-stepper";
import { getAllCrisisAlgorithms } from "@/lib/data";
import type { CrisisAlgorithm } from "@/lib/types";

export function EmergencyButton() {
  const [open, setOpen] = React.useState(false);
  const [algorithms, setAlgorithms] = React.useState<CrisisAlgorithm[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) getAllCrisisAlgorithms().then(setAlgorithms);
  }, [open]);

  const active = algorithms.find((a) => a.id === activeId) ?? null;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setActiveId(null); }}>
      <DialogTrigger asChild>
        <button
          aria-label="Emergency mode"
          className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2 rounded-full bg-critical px-4 py-3 text-critical-foreground shadow-lg shadow-critical/30 transition-transform hover:scale-105 active:scale-95"
        >
          <Siren className="h-5 w-5" />
          <span className="text-sm font-semibold">Emergency</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-critical">
              <Siren className="h-5 w-5" /> Emergency algorithms
            </DialogTitle>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto p-3">
          {active ? (
            <div className="space-y-2">
              <button onClick={() => setActiveId(null)} className="text-sm text-muted-foreground hover:text-foreground">
                ← All emergencies
              </button>
              <AlgorithmStepper algorithm={active} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {algorithms.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveId(a.id)}
                  className="flex items-start gap-3 rounded-lg border border-critical/20 bg-critical/5 p-3 text-left hover:border-critical/50 transition-colors"
                >
                  <Siren className="h-5 w-5 text-critical mt-0.5 shrink-0" />
                  <span className="space-y-1">
                    <span className="block font-medium leading-tight">{a.title}</span>
                    <span className="block text-xs text-muted-foreground">{a.triggerCriteria}</span>
                  </span>
                </button>
              ))}
              {algorithms.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground text-center py-8">No emergency algorithms loaded.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
