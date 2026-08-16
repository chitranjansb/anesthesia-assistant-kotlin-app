"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { SourceCitation } from "@/components/shared/source-citation";
import { cn } from "@/lib/utils";
import type { RegionalBlock } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm mt-0.5">{children}</p>
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <ul className="mt-1 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm flex gap-2">
            <span className="text-muted-foreground">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RegionalBlockCard({ block }: { block: RegionalBlock }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card id={block.id}>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{block.name}</CardTitle>
            <CardDescription>{block.targetNervesOrPlane}</CardDescription>
          </div>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform mt-1", expanded && "rotate-180")} />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="secondary">{block.category}</Badge>
          <VerificationBadge status={block.verificationStatus} />
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3 pt-0">
          <ListField label="Common indications" items={block.commonIndications} />
          <Field label="Patient position">{block.patientPosition}</Field>
          {block.landmarkTechnique && <Field label="Landmark technique">{block.landmarkTechnique}</Field>}
          {block.ultrasoundApproach && <Field label="Ultrasound approach / sonoanatomy">{block.ultrasoundApproach}</Field>}
          {block.needleApproach && <Field label="Needle approach">{block.needleApproach}</Field>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="LA volume (taught range)">{block.localAnestheticVolume}</Field>
            {block.onsetTime && <Field label="Onset">{block.onsetTime}</Field>}
          </div>
          <ListField label="Key complications" items={block.keyComplications} />
          <ListField label="Contraindications" items={block.contraindications} />
          <ListField label="Pearls" items={block.pearls} />
          <SourceCitation source={block.source} />
        </CardContent>
      )}
    </Card>
  );
}
