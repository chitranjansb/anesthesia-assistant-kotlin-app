"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { RegionalBlockCard } from "@/components/shared/regional-block-card";
import { LaMaxDoseCalculator } from "@/components/calculators/regional-calculators";
import { getAllRegionalBlocks, getAllCrisisAlgorithms } from "@/lib/data";
import type { RegionalBlock, RegionalBlockCategory, CrisisAlgorithm } from "@/lib/types";

const CATEGORIES: RegionalBlockCategory[] = ["Upper limb", "Lower limb", "Trunk & abdominal wall", "Neuraxial", "Head & neck"];

export default function RegionalPage() {
  const [blocks, setBlocks] = React.useState<RegionalBlock[]>([]);
  const [crisis, setCrisis] = React.useState<CrisisAlgorithm[]>([]);
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<RegionalBlockCategory | null>(null);

  React.useEffect(() => {
    getAllRegionalBlocks().then(setBlocks);
    getAllCrisisAlgorithms().then(setCrisis);
  }, []);

  const lastAlgorithm = crisis.find((c) => c.id === "last");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return blocks.filter((b) => {
      const matchesQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.targetNervesOrPlane.toLowerCase().includes(q) ||
        b.commonIndications.some((i) => i.toLowerCase().includes(q));
      const matchesCategory = !activeCategory || b.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [blocks, query, activeCategory]);

  const presentCategories = CATEGORIES.filter((c) => blocks.some((b) => b.category === c));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Regional Anesthesia</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Block library — indications, positioning, landmark and ultrasound descriptions, LA volume ranges, and key
          complications. Text descriptions only; sonoanatomy images/video are not built into this pass (see README).
        </p>
      </div>

      <DisclaimerBanner compact />

      {lastAlgorithm && (
        <Card className="border-critical/20">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{lastAlgorithm.title}</CardTitle>
              <CardDescription>Know this before you inject any local anesthetic — see Crisis Management.</CardDescription>
            </div>
            <Badge variant="critical">Crisis algorithm</Badge>
          </CardHeader>
        </Card>
      )}

      <LaMaxDoseCalculator />

      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by block name, target nerve, or indication…"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeCategory === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setActiveCategory(null)}
        >
          All ({blocks.length})
        </Badge>
        {presentCategories.map((c) => (
          <Badge
            key={c}
            variant={activeCategory === c ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveCategory(c)}
          >
            {c} ({blocks.filter((b) => b.category === c).length})
          </Badge>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((b) => (
          <RegionalBlockCard key={b.id} block={b} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No blocks match your search.</p>
        )}
      </div>
    </div>
  );
}
