"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { formatDateTime, formatStatus } from "@/lib/reports";

type PublicTrackPageProps = {
  params: Promise<{ publicId: string }>;
};

type PublicCaseEvent = {
  event_type: string;
  message: string;
  created_at: string;
};

type PublicReport = {
  public_id: string;
  status: string;
  location_name: string | null;
  overall_severity: "low" | "medium" | "high" | "critical";
  road_health_score: number;
  created_at: string;
  case_events: PublicCaseEvent[];
};

export default function PublicTrackPage({ params }: PublicTrackPageProps) {
  const { publicId } = use(params);
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );
  const [report, setReport] = useState<PublicReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReport() {
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/api/public/reports/${publicId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "This public report could not be found.");
      }

      setReport(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The report could not be loaded."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadReport();
    }, 0);

    return () => window.clearTimeout(timeout);
    // loadReport intentionally closes over publicId/apiUrl.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, publicId]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
          href="/public/track"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to tracking
        </Link>

        {isLoading ? (
          <Card className="mt-8 p-6">
            <p className="text-sm text-slate-600">Loading report status...</p>
          </Card>
        ) : null}

        {!isLoading && (error || !report) ? (
          <Card className="mt-8 p-6">
            <div className="flex gap-3">
              <AlertCircle aria-hidden="true" className="mt-1 h-5 w-5 text-red-600" />
              <div>
                <h1 className="text-xl font-semibold text-slate-950">
                  Report unavailable
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {error ?? "This public report could not be found."}
                </p>
                <Button className="mt-5" href="/public/report" variant="secondary">
                  Submit a new report
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {!isLoading && report ? (
          <div className="mt-8 space-y-5">
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-infrastructure-green">
                    Public report status
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-950">
                    {report.public_id}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    This page shows public status information only. Officer
                    notes and personal contact details are not displayed.
                  </p>
                </div>
                <SeverityBadge severity={report.overall_severity} />
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold capitalize text-slate-950">
                    {formatStatus(report.status)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Submitted
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatDateTime(report.created_at)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Location
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-lg font-semibold text-slate-950">
                    <MapPin
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-slate-500"
                    />
                    {report.location_name ?? "Location not specified"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Road health score
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {report.road_health_score.toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Clock aria-hidden="true" className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-950">
                  Public timeline
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-4 w-4 text-infrastructure-green"
                      />
                      Report submitted
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(report.created_at)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The report has been received and is available for authority
                    review.
                  </p>
                </div>

                {report.case_events.map((event) => (
                  <div
                    className="rounded-lg border border-slate-200 bg-white p-4"
                    key={`${event.event_type}-${event.created_at}`}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <p className="text-sm font-semibold capitalize text-slate-950">
                        {formatStatus(event.event_type)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(event.created_at)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {event.message}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
