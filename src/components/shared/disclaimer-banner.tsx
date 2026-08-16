import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "flex items-center gap-2 rounded-md border border-critical/30 bg-critical/5 px-3 py-2 text-xs text-critical"
          : "flex items-start gap-3 rounded-lg border border-critical/30 bg-critical/5 px-4 py-3 text-sm text-critical"
      }
      role="note"
    >
      <AlertTriangle className={compact ? "h-3.5 w-3.5 shrink-0" : "h-5 w-5 shrink-0"} />
      <p>
        <span className="font-semibold">For educational and clinical reference only.</span>{" "}
        Clinical decisions remain the responsibility of the treating physician. Always confirm doses and
        protocols against your institution&apos;s current guidelines before acting on them.
      </p>
    </div>
  );
}
