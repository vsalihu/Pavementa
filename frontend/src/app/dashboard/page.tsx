"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatCard } from "@/components/StatCard";
import type { AnalyticsSummary } from "@/lib/analytics";
import { percentOfTotal, totalCount } from "@/lib/analytics";
import { formatDate, formatStatus } from "@/lib/reports";

const severityOrder = ["critical", "high", "medium", "low"] as const;
const statusOrder = ["open", "under_review", "scheduled", "resolved", "rejected"] as const;
const priorityOrder = ["urgent", "high", "medium", "low"] as const;

const barColours: Record<string, string> = {
  critical: "bg-red-900",
  high: "bg-red-600",
  medium: "bg-safety-amber",
  low: "bg-infrastructure-green",
  urgent: "bg-red-700",
  open: "bg-slate-500",
  under_review: "bg-blue-500",
  scheduled: "bg-amber-500",
  resolved: "bg-emerald-600",
  rejected: "bg-slate-400",
};

function BreakdownBars({
  title,
  values,
  order,
}: {
  title: string;
  values: Record<string, number>;
  order: readonly string[];
}) {
  const total = totalCount(values);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-5 space-y-4">
        {order.map((key) => {
          const value = values[key] ?? 0;
          const percent = percentOfTotal(value, total);
          return (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium capitalize text-slate-700">
                  {formatStatus(key)}
                </span>
                <span className="text-slate-500">{value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${barColours[key] ?? "bg-slate-500"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ReportList({
  title,
  reports,
}: {
  title: string;
  reports: AnalyticsSummary["recent_reports"];
}) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-5 space-y-3">
        {reports.length > 0 ? (
          reports.map((report) => (
            <Link
              className="block rounded-md border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
              href={`/reports/${report.public_id}`}
              key={report.public_id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {report.public_id}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{report.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.location_name ?? "Location not specified"} ·{" "}
                    {formatDate(report.created_at)}
                  </p>
                </div>
                <SeverityBadge severity={report.overall_severity} />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Priority {report.priority} · Road health{" "}
                {report.road_health_score.toFixed(1)}
              </p>
            </Link>
          ))
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No reports available for this view.
          </div>
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAnalytics(showLoading = true) {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/api/analytics/summary`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? "Could not load analytics.");
      }
      setSummary(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load analytics. Check the backend connection."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadAnalytics(false);
    }, 0);
    return () => window.clearTimeout(timeout);
    // loadAnalytics intentionally closes over apiUrl.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  return (
    <AppShell>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                Analytics Dashboard
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Council-level insight across saved infrastructure reports,
                active cases, priorities, and road condition risk.
              </p>
            </div>
            <Button
              disabled={isLoading}
              onClick={() => {
                void loadAnalytics();
              }}
              variant="secondary"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-6">
            <p className="text-sm text-slate-600">Loading analytics...</p>
          </Card>
        ) : null}

        {!isLoading && error ? (
          <Card className="p-6">
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          </Card>
        ) : null}

        {!isLoading && !error && summary && summary.total_reports === 0 ? (
          <EmptyState
            actionHref="/upload"
            actionLabel="Upload an image"
            description="Save analysed reports to populate analytics for road health, priorities, statuses, and risk."
            icon={ClipboardList}
            title="No analytics data yet"
          />
        ) : null}

        {!isLoading && !error && summary && summary.total_reports > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                helper="Saved infrastructure reports"
                icon={FileText}
                label="Total reports"
                value={String(summary.total_reports)}
              />
              <StatCard
                helper="Open, review, or scheduled"
                icon={ClipboardList}
                label="Open cases"
                value={String(summary.open_cases)}
              />
              <StatCard
                helper="Require immediate attention"
                icon={AlertTriangle}
                label="Urgent cases"
                tone="red"
                value={String(summary.urgent_cases)}
              />
              <StatCard
                helper="Average condition score"
                icon={Gauge}
                label="Avg road health"
                tone="green"
                value={summary.average_road_health_score.toFixed(1)}
              />
              <StatCard
                helper="Closed operational cases"
                icon={CheckCircle2}
                label="Resolved"
                tone="green"
                value={String(summary.resolved_cases)}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <BreakdownBars
                order={severityOrder}
                title="Severity breakdown"
                values={summary.severity_breakdown}
              />
              <BreakdownBars
                order={statusOrder}
                title="Status breakdown"
                values={summary.status_breakdown}
              />
              <BreakdownBars
                order={priorityOrder}
                title="Priority breakdown"
                values={summary.priority_breakdown}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ReportList reports={summary.recent_reports} title="Recent reports" />
              <ReportList
                reports={summary.highest_risk_reports}
                title="Highest risk reports"
              />
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

