"use client";

/**
 * The app's signature visual element: a looping ECG-style trace, styled after
 * the waveform on an OT vital-signs monitor. Used sparingly — as a header
 * accent and a loading indicator — never as generic decoration.
 */
export function VitalsTrace({ className = "", tone = "primary" }: { className?: string; tone?: "primary" | "critical" }) {
  const stroke = tone === "critical" ? "hsl(var(--critical))" : "hsl(var(--primary))";
  return (
    <svg
      viewBox="0 0 600 80"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 40 L120 40 L140 40 L152 10 L164 70 L176 40 L200 40 L215 40 L228 20 L240 40 L260 40 L600 40"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1000"
        className="animate-trace"
      />
      <circle cx="152" cy="10" r="0" fill={stroke}>
        <animate attributeName="r" values="0;2;0" dur="3.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
