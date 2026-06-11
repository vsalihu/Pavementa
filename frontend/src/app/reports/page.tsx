"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, FileText, RefreshCw, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { ReportListItem, ReportSortValue } from "@/lib/reports";
import { formatDate, formatStatus } from "@/lib/reports";

const severityOptions = ["all", "critical", "high", "medium", "low"];
const statusOptions = ["all", "open", "under_review", "scheduled", "resolved", "rejected"];
const sortOptions: Array<{ label: string; value: ReportSortValue }> = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Road health low-high", value: "road_health_asc" },
  { label: "Road health high-low", value: "road_health_desc" },
];

export default function ReportsPage() {
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<ReportSortValue>("newest");

  async function loadReports(showLoading = true) {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (severity !== "all") params.set("severity", severity);
      if (status !== "all") params.set("status", status);
      params.set("sort", sort);

      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/api/reports?${params.toString()}`
      );
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
    }, 250);

    return () => window.clearTimeout(timeout);
    // loadReports intentionally closes over current filter state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, search, severity, status, sort]);

  return (
    <AppShell>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                Damage Registry
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Search, filter, and review saved infrastructure damage records
                from the Pavementa reporting database.
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

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.9fr]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Search registry
              </span>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-slate-200 px-3">
                <Search aria-hidden="true" className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Public ID, location, or title"
                  type="search"
                  value={search}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Severity
              </span>
              <select
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm capitalize text-slate-900"
                onChange={(event) => setSeverity(event.target.value)}
                value={severity}
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Status
              </span>
              <select
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm capitalize text-slate-900"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatStatus(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Sort</span>
              <select
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900"
                onChange={(event) =>
                  setSort(event.target.value as ReportSortValue)
                }
                value={sort}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Official damage records
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {reports.length} record{reports.length === 1 ? "" : "s"} matching
              current registry criteria.
            </p>
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
                description="No saved report matches the current registry filters. Save a detection result or adjust the search criteria."
                icon={FileText}
                title="No damage records found"
              />
            </div>
          ) : null}

          {!isLoading && !error && reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Public ID</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Road health</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr className="hover:bg-slate-50" key={report.public_id}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-950">
                          {report.public_id}
                        </div>
                        <div className="mt-1 max-w-56 truncate text-xs text-slate-500">
                          {report.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {report.location_name ?? "Location not specified"}
                      </td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={report.overall_severity} />
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-700">
                        {report.priority}
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
                          className="min-h-10 px-3"
                          href={`/reports/${report.public_id}`}
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
      </div>
    </AppShell>
  );
}
