"use client";

import * as React from "react";
import { CheckSquare, Square, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { SourceCitation } from "@/components/shared/source-citation";
import type { Checklist } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InteractiveChecklist({ checklist }: { checklist: Checklist }) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const doneCount = checklist.items.filter((i) => checked[i.id]).length;
  const allDone = doneCount === checklist.items.length;

  return (
    <Card id={checklist.id}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{checklist.title}</CardTitle>
            <VerificationBadge status={checklist.verificationStatus} />
          </div>
          <CardDescription>{checklist.phase}</CardDescription>
        </div>
        <span className={cn("clinical-value text-sm font-semibold shrink-0", allDone && "text-primary")}>
          {doneCount}/{checklist.items.length}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {checklist.items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <button
              key={item.id}
              onClick={() => setChecked((c) => ({ ...c, [item.id]: !c[item.id] }))}
              className="flex w-full items-center gap-2 rounded-md bg-secondary/50 px-3 py-2.5 text-left text-sm"
            >
              {isChecked ? <CheckSquare className="h-4 w-4 text-primary shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
              <span className={cn("flex-1", isChecked && "line-through text-muted-foreground")}>{item.label}</span>
              {item.critical && !isChecked && <span className="text-[10px] uppercase tracking-wide text-critical shrink-0">Critical</span>}
            </button>
          );
        })}
        <div className="flex justify-end pt-1">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setChecked({})}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
        <SourceCitation source={checklist.source} />
      </CardContent>
    </Card>
  );
}
