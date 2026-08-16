"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/shared/disclaimer-banner";
import { DrugCard } from "@/components/drugs/drug-card";
import { getAllDrugs } from "@/lib/data";
import type { Drug } from "@/lib/types";

export default function DrugsPage() {
  const [drugs, setDrugs] = React.useState<Drug[]>([]);
  const [query, setQuery] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [hash, setHash] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAllDrugs().then(setDrugs);
    setHash(window.location.hash.replace("#", "") || null);
  }, []);

  const allTags = React.useMemo(() => {
    const s = new Set<string>();
    drugs.forEach((d) => d.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [drugs]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return drugs.filter((d) => {
      const matchesQuery =
        !q ||
        d.genericName.toLowerCase().includes(q) ||
        d.brandExamplesIndia.some((b) => b.toLowerCase().includes(q)) ||
        d.drugClass.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !activeTag || d.tags.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [drugs, query, activeTag]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Drug Handbook</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search {drugs.length} drug{drugs.length === 1 ? "" : "s"}. Every entry shows its verification status —
          check it before you rely on a dose.
        </p>
      </div>

      <DisclaimerBanner compact />

      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by generic name, brand, class, or tag…"
          className="border-0 bg-transparent focus-visible:ring-0 px-0 h-auto py-0"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTag(null)}>
          <Badge variant={activeTag === null ? "default" : "outline"}>All</Badge>
        </button>
        {allTags.map((t) => (
          <button key={t} onClick={() => setActiveTag(t === activeTag ? null : t)}>
            <Badge variant={activeTag === t ? "default" : "outline"}>{t}</Badge>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((d) => (
          <DrugCard key={d.id} drug={d} defaultOpen={hash === d.id} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-12 text-center">No drugs match your search.</p>
        )}
      </div>
    </div>
  );
}
