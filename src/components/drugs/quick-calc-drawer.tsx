"use client";

import * as React from "react";
import { Calculator, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { idealBodyWeight, leanBodyWeight, mcgKgMinToMlPerHr } from "@/lib/calculators";

// A fast weight + IBW/LBW + infusion converter drawer, openable from any drug.
export function QuickCalcDrawer({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [weight, setWeight] = React.useState<string>("");
  const [height, setHeight] = React.useState<string>("");
  const [sex, setSex] = React.useState<"male" | "female">("male");
  const [dose, setDose] = React.useState<string>("");
  const [conc, setConc] = React.useState<string>("");

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const d = parseFloat(dose) || 0;
  const c = parseFloat(conc) || 0;

  const ibw = h > 0 ? idealBodyWeight(h, sex) : 0;
  const lbw = h > 0 && w > 0 ? leanBodyWeight(w, h, sex) : 0;
  const totalMg = w > 0 && d > 0 ? w * d : 0;
  const mlPerHr = w > 0 && d > 0 && c > 0 ? mcgKgMinToMlPerHr(d, w, c) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Calculator className="h-4 w-4" /> Quick calc
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Quick weight &amp; infusion calc
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Weight (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
            </div>
            <div>
              <Label className="text-xs">Height (cm)</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" />
            </div>
            <div>
              <Label className="text-xs">Sex</Label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as "male" | "female")}
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md bg-secondary/50 p-3 text-sm">
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">IBW (Devine)</p>
              <p className="clinical-value font-semibold">{h > 0 ? ibw.toFixed(1) : "—"} kg</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-muted-foreground">LBW (Boer)</p>
              <p className="clinical-value font-semibold">{h > 0 && w > 0 ? lbw.toFixed(1) : "—"} kg</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Label className="text-xs">Dose (mcg/kg/min)</Label>
              <Input type="number" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="0.1" />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">Conc (mcg/mL)</Label>
              <Input type="number" value={conc} onChange={(e) => setConc(e.target.value)} placeholder="40" />
            </div>
            <div className="col-span-1 flex items-end">
              <div className="rounded-md bg-primary/10 px-3 py-2 w-full">
                <p className="text-[11px] uppercase text-muted-foreground">→ mL/hr</p>
                <p className="clinical-value font-semibold">{mlPerHr > 0 ? mlPerHr.toFixed(1) : "—"}</p>
              </div>
            </div>
          </div>

          {w > 0 && d > 0 && (
            <p className="text-xs text-muted-foreground">
              Total bolus at {d} mcg/kg = <span className="font-medium text-foreground">{(totalMg / 1000).toFixed(2)} mg</span> (for mcg/kg conversions adjust units).
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
