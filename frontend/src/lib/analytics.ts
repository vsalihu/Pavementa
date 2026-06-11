import type { ReportListItem } from "@/lib/reports";

export type AnalyticsSummary = {
  total_reports: number;
  open_cases: number;
  urgent_cases: number;
  resolved_cases: number;
  average_road_health_score: number;
  severity_breakdown: Record<"low" | "medium" | "high" | "critical", number>;
  status_breakdown: Record<
    "open" | "under_review" | "scheduled" | "resolved" | "rejected",
    number
  >;
  priority_breakdown: Record<"low" | "medium" | "high" | "urgent", number>;
  recent_reports: ReportListItem[];
  highest_risk_reports: ReportListItem[];
};

export function totalCount(values: Record<string, number>) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

export function percentOfTotal(value: number, total: number) {
  if (total === 0) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

