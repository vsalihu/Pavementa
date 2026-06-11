import type { LucideIcon } from "lucide-react";
import { MetricCard } from "./MetricCard";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "green" | "amber" | "red" | "slate";
};

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "slate",
}: StatCardProps) {
  return (
    <MetricCard helper={helper} icon={Icon} label={label} tone={tone} value={value} />
  );
}
