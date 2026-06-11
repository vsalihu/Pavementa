import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: LucideIcon;
  tone?: "green" | "amber" | "red" | "slate" | "navy";
};

const tones = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700",
  navy: "bg-slate-900 text-white",
};

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "slate",
}: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        {Icon ? (
          <div className={`rounded-md p-2.5 ${tones[tone]}`}>
            <Icon aria-hidden="true" className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {helper ? <p className="mt-4 text-sm leading-6 text-slate-500">{helper}</p> : null}
    </Card>
  );
}
