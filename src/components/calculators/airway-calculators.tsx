"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { pediatricEttSizeMm, pediatricEttDepthCm, pediatricEttDepthByTubeSizeCm, LMA_SIZE_CHART } from "@/lib/calculators";

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
        {typeof value === "number" ? value.toFixed(1) : value} {unit}
      </span>
    </div>
  );
}

export function EttSizingCalculator() {
  const age = useNum(4);
  const [cuffed, setCuffed] = React.useState(false);
  const size = pediatricEttSizeMm(age.value, cuffed);
  const depthByAge = pediatricEttDepthCm(age.value);
  const depthByTube = pediatricEttDepthByTubeSizeCm(size);

  return (
    <Card id="ett-sizing">
      <CardHeader>
        <CardTitle>Pediatric ETT size & depth</CardTitle>
        <CardDescription>Cole&apos;s formula for size (age ≥ 1 year); two common depth estimates. Always confirm by auscultation ± capnography/CXR.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <Label>Age (years)</Label>
            <Input type="number" step="0.5" value={age.raw} onChange={(e) => age.setRaw(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Switch checked={cuffed} onCheckedChange={setCuffed} id="cuffed" />
            <Label htmlFor="cuffed">Cuffed tube</Label>
          </div>
        </div>
        <div className="space-y-2">
          <ResultRow label="Internal diameter" value={size} unit="mm" />
          <ResultRow label="Depth estimate (age/2 + 12)" value={depthByAge} unit="cm at lips" />
          <ResultRow label="Depth estimate (3 × tube size)" value={depthByTube} unit="cm at lips" />
        </div>
      </CardContent>
    </Card>
  );
}

export function LmaSizingReference() {
  return (
    <Card id="lma-sizing">
      <CardHeader>
        <CardTitle>LMA size by weight</CardTitle>
        <CardDescription>Standard manufacturer sizing chart — confirm against the specific device you&apos;re using.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {LMA_SIZE_CHART.map((row) => (
            <div key={row.size} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">Weight {row.weightRangeKg} kg</span>
              <span className="clinical-value text-sm font-semibold">Size {row.size}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
