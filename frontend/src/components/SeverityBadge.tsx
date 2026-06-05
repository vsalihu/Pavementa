type Severity = "critical" | "high" | "medium" | "low" | "review";

type SeverityBadgeProps = {
  severity: Severity;
};

const severityStyles: Record<Severity, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  review: "border-slate-200 bg-slate-50 text-slate-700",
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${severityStyles[severity]}`}
    >
      {severity}
    </span>
  );
}

