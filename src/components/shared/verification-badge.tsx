import { ShieldCheck, ShieldAlert, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const CONFIG: Record<VerificationStatus, { label: string; variant: "verified" | "review" | "seed"; icon: typeof ShieldCheck }> = {
  verified: { label: "Clinician-verified", variant: "verified", icon: ShieldCheck },
  "needs-review": { label: "Needs review", variant: "review", icon: ShieldAlert },
  "unverified-ai-seed": { label: "Unverified seed data — do not use clinically", variant: "seed", icon: FlaskConical },
};

export function VerificationBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  const { label, variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
