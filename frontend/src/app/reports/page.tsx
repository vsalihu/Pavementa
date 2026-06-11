"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { ReportListItem } from "@/lib/reports";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default function ReportsPage() {
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReports(showLoading = true) {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/reports`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "Could not load reports.");
      }

      setReports(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load reports. Check the backend connection."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadReports(false);
    }, 0);

    return () => window.clearTimeout(timeout);
    // apiUrl is stable for the current browser session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  return (
    <AppShell>
      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Report registry
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saved road damage analysis reports from the backend database.
            </p>
          </div>
          <Button
            disabled={isLoading}
            onClick={() => {
              void loadReports();
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

        {isLoading ? (
          <div className="p-6">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Loading saved reports...
            </div>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="p-6">
            <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0"
              />
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && reports.length === 0 ? (
          <div className="p-6">
            <EmptyState
              actionHref="/upload"
              actionLabel="Upload an image"
              description="Save a detection result to create the first road damage report in the registry."
              icon={FileText}
              title="No saved reports yet"
            />
          </div>
        ) : null}

        {!isLoading && !error && reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Public ID</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Road health</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr className="hover:bg-slate-50" key={report.public_id}>
                    <td className="px-6 py-4 font-semibold text-slate-950">
                      {report.public_id}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {report.location_name ?? "Location not specified"}
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={report.overall_severity} />
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {report.road_health_score.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-700">
                      {formatStatus(report.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        disabled
                        title={`Details page planned for ${report.public_id}`}
                        variant="secondary"
                      >
                        View details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </AppShell>
  );
}
