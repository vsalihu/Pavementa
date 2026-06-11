type PriorityBadgeProps = {
  priority: string;
};

const priorityStyles: Record<string, string> = {
  urgent: "border-red-200 bg-red-50 text-red-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
        priorityStyles[priority] ?? "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {priority}
    </span>
  );
}
