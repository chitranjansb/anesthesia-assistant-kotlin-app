import { BookMarked } from "lucide-react";
import type { SourceRef } from "@/lib/types";

export function SourceCitation({ source }: { source: SourceRef }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border/70 bg-secondary/50 p-3 text-xs text-muted-foreground">
      <BookMarked className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">
          {source.organization} — {source.title} ({source.year})
        </p>
        <p>
          {source.version ? `Version ${source.version} · ` : ""}
          {source.lastUpdated ? `Last updated ${source.lastUpdated}` : "Last updated date not on file"}
          {source.evidenceLevel ? ` · ${source.evidenceLevel}` : ""}
        </p>
        {source.url && (
          <a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
            View source document
          </a>
        )}
      </div>
    </div>
  );
}
