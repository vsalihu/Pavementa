"use client";

import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Download,
  FileCheck2,
  Send,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SeverityBadge } from "@/components/SeverityBadge";
import {
  DETECTION_RESULT_STORAGE_KEY,
  type DetectionResult,
} from "@/lib/detection-result";
import {
  buildReportPayload,
  type ReportRead,
  type ReportSaveForm,
} from "@/lib/reports";

function subscribe() {
  return () => undefined;
}

function getStoredDetectionResult(): DetectionResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem(DETECTION_RESULT_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as DetectionResult;
  } catch {
    return null;
  }
}

function getServerSnapshot() {
  return null;
}

function formatConfidence(confidence: number) {
  return `${(confidence * 100).toFixed(0)}%`;
}

export default function ResultsPage() {
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );
  const [form, setForm] = useState<ReportSaveForm>({
    title: "",
    location_name: "",
    latitude: "",
    longitude: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedReport, setSavedReport] = useState<ReportRead | null>(null);

  const result = useSyncExternalStore(
    subscribe,
    getStoredDetectionResult,
    getServerSnapshot
  );

  async function saveReport() {
    if (!result) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSavedReport(null);

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildReportPayload(result, form)),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ?? "Report could not be saved.");
      }

      setSavedReport(data);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Report could not be saved. Check the backend connection."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!result) {
    return (
      <AppShell>
        <EmptyState
          actionHref="/upload"
          actionLabel="Upload an image"
          description="Run an image analysis first to review annotated detections, confidence scores, and suggested next actions."
          icon={UploadCloud}
          title="No analysis result found"
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                Detection Results
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Review the latest prototype analysis output before saving,
                exporting, or sending the case for operational review.
              </p>
            </div>
            <SeverityBadge severity={result.summary.overall_severity} />
          </div>

          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <ShieldAlert
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Prototype mode notice
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-900">
                  {result.note}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Original image
            </p>
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <Image
                alt="Original analysed road image"
                className="object-cover"
                fill
                src={result.original_image_url}
                unoptimized
              />
            </div>
          </Card>

          <Card className="p-6">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Annotated image
            </p>
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <Image
                alt="Annotated prototype detection image"
                className="object-cover"
                fill
                src={result.annotated_image_url}
                unoptimized
              />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Total detections
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {result.summary.total_detections}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Highest confidence
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {formatConfidence(result.summary.highest_confidence)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Overall severity
            </p>
            <div className="mt-4">
              <SeverityBadge severity={result.summary.overall_severity} />
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">Analysis mode</p>
            <p className="mt-3 text-lg font-semibold capitalize text-slate-950">
              {result.analysis_mode ?? result.mode}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {result.model_name ?? "General YOLO model"}
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Detection list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Prototype object detections returned by the current model.
            </p>
          </div>
          {result.detections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Label</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Bounding box coordinates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.detections.map((detection, index) => (
                    <tr className="hover:bg-slate-50" key={`${detection.label}-${index}`}>
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
                        x1 {detection.box.x1}, y1 {detection.box.y1}, x2{" "}
                        {detection.box.x2}, y2 {detection.box.y2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                No objects were detected by the prototype model in this image.
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Suggested next actions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Save the current analysis as a report, then continue with review or
            export workflows when those stages are implemented.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="report-title"
              >
                Report title
              </label>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                id="report-title"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Example: A41 road surface review"
                type="text"
                value={form.title}
              />
            </div>
            <div className="lg:col-span-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="location-name"
              >
                Location name
              </label>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                id="location-name"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location_name: event.target.value,
                  }))
                }
                placeholder="Example: A41 Northbound, Sector 4"
                type="text"
                value={form.location_name}
              />
            </div>
            <div className="lg:col-span-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="latitude"
              >
                Latitude
              </label>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                id="latitude"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    latitude: event.target.value,
                  }))
                }
                placeholder="Example: 51.5074"
                type="number"
                value={form.latitude}
              />
            </div>
            <div className="lg:col-span-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="longitude"
              >
                Longitude
              </label>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                id="longitude"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    longitude: event.target.value,
                  }))
                }
                placeholder="Example: -0.1278"
                type="number"
                value={form.longitude}
              />
            </div>
          </div>

          {savedReport ? (
            <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Report saved successfully. Public report ID:{" "}
              <span className="font-semibold">{savedReport.public_id}</span>
            </div>
          ) : null}

          {saveError ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {saveError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Button disabled={isSaving} onClick={saveReport} variant="secondary">
              <FileCheck2 aria-hidden="true" className="h-4 w-4" />
              {isSaving ? "Saving" : "Save report"}
            </Button>
            <Button variant="secondary">
              <Download aria-hidden="true" className="h-4 w-4" />
              Export report
            </Button>
            <Button>
              <Send aria-hidden="true" className="h-4 w-4" />
              Send for review
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
