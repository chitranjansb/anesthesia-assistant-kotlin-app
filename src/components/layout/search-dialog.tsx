"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Pill, FileText, Siren, ListChecks, Calculator, Wind, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildSearchIndex, filterDocs } from "@/lib/search";
import type { SearchDoc, SearchableKind } from "@/lib/types";

const KIND_ICON: Record<SearchableKind, typeof Pill> = {
  drug: Pill,
  protocol: FileText,
  crisis: Siren,
  checklist: ListChecks,
  calculator: Calculator,
  airway: Wind,
  "regional-block": Target,
};

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = React.useState("");
  const [allDocs, setAllDocs] = React.useState<SearchDoc[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (open && !loaded) {
      buildSearchIndex().then((docs) => {
        setAllDocs(docs);
        setLoaded(true);
      });
    }
  }, [open, loaded]);

  const results = React.useMemo(() => filterDocs(allDocs, query), [allDocs, query]);

  function go(doc: SearchDoc) {
    router.push(doc.href);
    onOpenChange(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] translate-y-0 max-w-xl p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Global search</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              placeholder="Search drugs, protocols, crisis algorithms, calculators…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 px-0 h-auto py-1"
            />
          </div>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto p-2">
          {query && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches for &ldquo;{query}&rdquo;.</p>
          )}
          {!query && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Start typing to search the whole app.</p>
          )}
          {results.map((doc) => {
            const Icon = KIND_ICON[doc.kind];
            return (
              <button
                key={`${doc.kind}-${doc.id}`}
                onClick={() => go(doc)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex-1">
                  <span className="block font-medium">{doc.title}</span>
                  {doc.subtitle && <span className="block text-xs text-muted-foreground">{doc.subtitle}</span>}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{doc.kind}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
