import { formatStatus } from "@/lib/reports";

type StatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  open: "border-blue-200 bg-blue-50 text-blue-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-800",
  scheduled: "border-indigo-200 bg-indigo-50 text-indigo-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-slate-200 bg-slate-50 text-slate-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
        statusStyles[status] ?? "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}
