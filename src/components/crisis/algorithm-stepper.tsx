"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TimerIcon, Pill, CheckSquare, Square } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceCitation } from "@/components/shared/source-citation";
import { VerificationBadge } from "@/components/shared/verification-badge";
import type { CrisisAlgorithm } from "@/lib/types";
import { cn } from "@/lib/utils";

function StepTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = React.useState(seconds);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!running) return;
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  React.useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
  }, [seconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
      <TimerIcon className="h-4 w-4 text-primary shrink-0" />
      <span className="clinical-value text-lg font-semibold tabular-nums flex-1">
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
      <Button size="sm" variant={running ? "secondary" : "default"} onClick={() => setRunning((r) => !r)}>
        {running ? "Pause" : remaining === seconds ? "Start" : "Resume"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => { setRemaining(seconds); setRunning(false); }}>
        Reset
      </Button>
    </div>
  );
}

export function AlgorithmStepper({ algorithm }: { algorithm: CrisisAlgorithm }) {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const step = algorithm.steps[stepIndex];

  function toggle(key: string) {
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  }

  return (
    <Card id={algorithm.id} className="border-critical/30">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{algorithm.title}</CardTitle>
            <VerificationBadge status={algorithm.verificationStatus} />
          </div>
          <CardDescription className="mt-1">{algorithm.triggerCriteria}</CardDescription>
        </div>
        <Badge variant="critical">{algorithm.category}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-1.5">
          {algorithm.steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStepIndex(i)}
              aria-label={`Go to step ${i + 1}`}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i === stepIndex ? "bg-critical" : i < stepIndex ? "bg-critical/40" : "bg-secondary"
              )}
            />
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Step {stepIndex + 1} of {algorithm.steps.length}
          </p>
          <h3 className="font-display text-lg font-semibold">{step.title}</h3>
          <p className="text-sm">{step.instruction}</p>

          {step.timerSeconds && <StepTimer seconds={step.timerSeconds} />}

          {step.drugSuggestions && step.drugSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {step.drugSuggestions.map((id) => (
                <Link key={id} href={`/drugs#${id}`}>
                  <Badge variant="secondary" className="gap-1 cursor-pointer">
                    <Pill className="h-3 w-3" /> {id}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {step.checklist && step.checklist.length > 0 && (
            <div className="space-y-1.5">
              {step.checklist.map((item, i) => {
                const key = `${step.id}-${i}`;
                const isChecked = !!checked[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className="flex w-full items-center gap-2 rounded-md bg-secondary/50 px-3 py-2 text-left text-sm"
                  >
                    {isChecked ? <CheckSquare className="h-4 w-4 text-primary shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className={cn(isChecked && "line-through text-muted-foreground")}>{item}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {stepIndex === algorithm.steps.length - 1 && <SourceCitation source={algorithm.source} />}
      </CardContent>

      <CardFooter className="justify-between gap-3 border-t border-border/60 pt-4">
        <Button
          variant="outline"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={() => setStepIndex((i) => Math.min(algorithm.steps.length - 1, i + 1))}
          disabled={stepIndex === algorithm.steps.length - 1}
          className="gap-1"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
