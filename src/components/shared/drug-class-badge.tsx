import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { DrugClassColor } from "@/lib/types";
import { cn } from "@/lib/utils";

// Tailwind class per class color. Kept static (no dynamic concat) so JIT picks it up.
const COLOR_CLASS: Record<DrugClassColor, string> = {
  indigo: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  orange: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  teal: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30",
  slate: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  fuchsia: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30",
  lime: "bg-lime-500/15 text-lime-700 dark:text-lime-300 border-lime-500/30",
  cyan: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
};

export function DrugClassBadge({ drugClass, color, className }: { drugClass: string; color?: DrugClassColor; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", color ? COLOR_CLASS[color] : "border-border bg-secondary text-secondary-foreground", className)}>
      {drugClass}
    </span>
  );
}

export function ColorDot({ color }: { color?: DrugClassColor }) {
  if (!color) return null;
  // small colored dot reuse of the same palette via inline class
  const dot: Record<DrugClassColor, string> = {
    indigo: "bg-indigo-500", rose: "bg-rose-500", amber: "bg-amber-500", emerald: "bg-emerald-500",
    sky: "bg-sky-500", violet: "bg-violet-500", orange: "bg-orange-500", teal: "bg-teal-500",
    slate: "bg-slate-500", fuchsia: "bg-fuchsia-500", lime: "bg-lime-500", cyan: "bg-cyan-500",
  };
  return <span className={cn("inline-block h-2.5 w-2.5 rounded-full", dot[color])} />;
}
