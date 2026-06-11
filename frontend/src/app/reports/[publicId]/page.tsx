"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ClipboardList, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { ReportRead } from "@/lib/reports";
import {
  formatConfidence,
  formatDateTime,
  formatStatus,
  getCaseRecommendation,
} from "@/lib/reports";

type ReportDetailPageProps = {
  params: Promise<{ publicId: string }>;
};

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { publicId } = use(params);
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );
  const [report, setReport] = useState<ReportRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      async function loadReport() {
        setError(null);

        try {
          const response = await fetch(
            `${apiUrl.replace(/\/$/, "")}/api/reports/${publicId}`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail ?? "Could not load report.");
          }

          setReport(data);
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load report. Check the backend connection."
          );
        } finally {
          setIsLoading(false);
        }
      }

      void loadReport();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [apiUrl, publicId]);

  if (isLoading) {
    return (
      <AppShell>
        <Card className="p-6">
          <p className="text-sm text-slate-600">Loading official report...</p>
        </Card>
      </AppShell>
    );
  }

  if (error || !report) {
    return (
      <AppShell>
        <EmptyState
          actionHref="/reports"
          actionLabel="Back to registry"
          description={error ?? "The requested report could not be found."}
          icon={AlertCircle}
          title="Report unavailable"
        />
      </AppShell>
    );
  }

  const recommendation = getCaseRecommendation(report);
  const hasCoordinates =
    typeof report.latitude === "number" && typeof report.longitude === "number";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
              href="/reports"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to Damage Registry
            </Link>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">
              {report.public_id}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {report.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={report.overall_severity} />
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-700">
              {formatStatus(report.status)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Damage count</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {report.detections.length}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Highest severity
            </p>
            <div className="mt-4">
              <SeverityBadge severity={report.overall_severity} />
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Recommended priority
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {recommendation.priority}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Road health score
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {report.road_health_score.toFixed(1)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <ClipboardList
              aria-hidden="true"
              className="mt-1 h-5 w-5 text-infrastructure-green"
            />
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Case summary
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {recommendation.action}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Record metadata
            </h3>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Location", report.location_name ?? "Location not specified"],
                [
                  "Coordinates",
                  hasCoordinates
                    ? `${report.latitude?.toFixed(6)}, ${report.longitude?.toFixed(6)}`
                    : "Not provided",
                ],
                ["Analysis mode", report.analysis_mode],
                ["Model name", report.model_name],
                ["Created", formatDateTime(report.created_at)],
                ["Updated", formatDateTime(report.updated_at)],
              ].map(([label, value]) => (
                <div
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  key={label}
                >
                  <dt className="font-medium text-slate-500">{label}</dt>
                  <dd className="text-right font-semibold text-slate-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {hasCoordinates ? (
              <div className="mt-5 flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                Coordinates are stored for later GIS map integration.
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Evidence images
            </h3>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Original image
                </p>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image
                    alt="Original road evidence"
                    className="object-cover"
                    fill
                    src={report.original_image_url}
                    unoptimized
                  />
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Annotated image
                </p>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image
                    alt="Annotated detection evidence"
                    className="object-cover"
                    fill
                    src={report.annotated_image_url}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Detection records
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Stored detections associated with this infrastructure report.
            </p>
          </div>
          {report.detections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Label</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Bounding box coordinates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.detections.map((detection) => (
                    <tr className="hover:bg-slate-50" key={detection.id}>
                      <td className="px-6 py-4 font-semibold capitalize text-slate-950">
                        {detection.label}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatConfidence(detection.confidence)}
                      </td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={detection.severity} />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        x1 {detection.x1}, y1 {detection.y1}, x2 {detection.x2},
                        y2 {detection.y2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                No detections were stored for this report.
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
