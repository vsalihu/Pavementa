"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapPinned, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { ReportListItem } from "@/lib/reports";

type MappedReport = ReportListItem & {
  latitude: number;
  longitude: number;
};

const severityColours = {
  low: "#1f8f5f",
  medium: "#d89a18",
  high: "#dc2626",
  critical: "#7f1d1d",
};

function hasValidCoordinates(report: ReportListItem): report is MappedReport {
  return (
    typeof report.latitude === "number" &&
    Number.isFinite(report.latitude) &&
    report.latitude >= -90 &&
    report.latitude <= 90 &&
    typeof report.longitude === "number" &&
    Number.isFinite(report.longitude) &&
    report.longitude >= -180 &&
    report.longitude <= 180
  );
}

function averageRoadHealth(reports: MappedReport[]) {
  if (reports.length === 0) {
    return 0;
  }

  const total = reports.reduce((sum, report) => sum + report.road_health_score, 0);
  return total / reports.length;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mappedReports = useMemo(
    () => reports.filter(hasValidCoordinates),
    [reports]
  );
  const criticalHighCount = mappedReports.filter(
    (report) =>
      report.overall_severity === "critical" ||
      report.overall_severity === "high"
  ).length;
  const averageHealth = averageRoadHealth(mappedReports);

  async function loadReports(showLoading = true) {
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/api/reports?sort=newest`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "Could not load mapped reports.");
      }

      setReports(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load mapped reports. Check the backend connection."
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
    // loadReports intentionally closes over apiUrl.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  useEffect(() => {
    if (
      !mapboxToken ||
      isLoading ||
      error ||
      mappedReports.length === 0 ||
      !mapContainerRef.current ||
      mapRef.current
    ) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-1.5, 52.5],
      zoom: 5.4,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [error, isLoading, mapboxToken, mappedReports.length]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    mappedReports.forEach((report) => {
      const markerElement = document.createElement("div");
      markerElement.className =
        "h-4 w-4 rounded-full border-2 border-white shadow-lg shadow-slate-900/30";
      markerElement.style.backgroundColor =
        severityColours[report.overall_severity];

      const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(`
        <div style="font-family: Arial, sans-serif; min-width: 220px;">
          <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 700;">${escapeHtml(report.public_id)}</p>
          <h3 style="margin: 6px 0 4px; font-size: 15px; color: #0f172a;">${escapeHtml(report.title)}</h3>
          <p style="margin: 0 0 8px; font-size: 13px; color: #475569;">${escapeHtml(report.location_name ?? "Location not specified")}</p>
          <p style="margin: 0 0 4px; font-size: 13px; color: #475569;">Severity: <strong>${escapeHtml(report.overall_severity)}</strong></p>
          <p style="margin: 0 0 12px; font-size: 13px; color: #475569;">Road health: <strong>${report.road_health_score.toFixed(1)}</strong></p>
          <a href="/reports/${encodeURIComponent(report.public_id)}" style="display: inline-block; border-radius: 6px; background: #1f8f5f; color: white; padding: 8px 10px; font-size: 12px; font-weight: 700; text-decoration: none;">View report</a>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([report.longitude, report.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    if (mappedReports.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      mappedReports.forEach((report) => {
        bounds.extend([report.longitude, report.latitude]);
      });
      mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 13 });
    }
  }, [mappedReports]);

  const missingToken = !mapboxToken;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Spatial intelligence"
          title="Road Condition GIS Map"
          description="Spatial view of saved damage reports with valid latitude and longitude coordinates."
          actions={
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
          }
        />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card className="overflow-hidden">
          <div className="p-6">
            {isLoading ? (
              <LoadingState
                className="min-h-[520px] lg:min-h-[620px]"
                message="Loading mapped reports..."
              />
            ) : null}

            {!isLoading && error ? (
              <ErrorState
                className="min-h-[520px] items-center lg:min-h-[620px]"
                message={error}
                title="Map data unavailable"
              />
            ) : null}

            {!isLoading && !error && missingToken ? (
              <EmptyState
                description="Add NEXT_PUBLIC_MAPBOX_TOKEN to frontend/.env.local to enable the interactive GIS map."
                icon={MapPinned}
                title="Mapbox token required"
              />
            ) : null}

            {!isLoading && !error && !missingToken && mappedReports.length === 0 ? (
              <EmptyState
                actionHref="/results"
                actionLabel="Review latest analysis"
                description="Reports need latitude and longitude before they can appear on the GIS map. Add coordinates when saving a report from the results page."
                icon={MapPinned}
                title="No mapped reports yet"
              />
            ) : null}

            {!isLoading && !error && !missingToken && mappedReports.length > 0 ? (
              <div
                className="min-h-[520px] overflow-hidden rounded-lg border border-slate-200 lg:min-h-[620px]"
                ref={mapContainerRef}
              />
            ) : null}
          </div>
        </Card>

        <aside className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Map summary
            </h3>
            <div className="mt-5 grid gap-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Total mapped reports
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {mappedReports.length}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Critical/high issues
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {criticalHighCount}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Average road health
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {mappedReports.length > 0 ? averageHealth.toFixed(1) : "0.0"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Mapped reports
            </h3>
            <div className="mt-5 space-y-3">
              {mappedReports.length > 0 ? (
                mappedReports.map((report) => (
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
                        <p className="mt-1 text-sm text-slate-600">
                          {report.location_name ?? "Location not specified"}
                        </p>
                      </div>
                      <SeverityBadge severity={report.overall_severity} />
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Road health {report.road_health_score.toFixed(1)} -{" "}
                      {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  No reports with valid coordinates are available yet.
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>
      </div>
    </AppShell>
  );
}
