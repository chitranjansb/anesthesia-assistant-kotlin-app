"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { SourceCitation } from "@/components/shared/source-citation";
import type { Protocol } from "@/lib/types";

export function ProtocolCard({ protocol }: { protocol: Protocol }) {
  return (
    <Card id={protocol.id}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{protocol.title}</CardTitle>
          <VerificationBadge status={protocol.verificationStatus} />
        </div>
        <CardDescription>{protocol.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible>
          {protocol.sections.map((s, i) => (
            <AccordionItem key={i} value={`section-${i}`}>
              <AccordionTrigger>{s.heading}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{s.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {protocol.flowchartDescription && (
          <div className="rounded-md border border-border/70 bg-secondary/40 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Decision flow: </span>
            {protocol.flowchartDescription}
          </div>
        )}
        <SourceCitation source={protocol.source} />
      </CardContent>
    </Card>
  );
}
