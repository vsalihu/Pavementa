import type { DetectionResult } from "@/lib/detection-result";

export type ReportSaveForm = {
  title: string;
  location_name: string;
  latitude: string;
  longitude: string;
};

export type ReportListItem = {
  public_id: string;
  title: string;
  location_name: string | null;
  status: string;
  overall_severity: "low" | "medium" | "high" | "critical";
  road_health_score: number;
  analysis_mode: string;
  model_name: string;
  created_at: string;
};

export type ReportRead = ReportListItem & {
  original_image_url: string;
  annotated_image_url: string;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
  detections: Array<{
    id: number;
    label: string;
    confidence: number;
    severity: "low" | "medium" | "high" | "critical";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    created_at: string;
  }>;
};

export function buildReportPayload(
  result: DetectionResult,
  form: ReportSaveForm
) {
  return {
    title: form.title.trim() || undefined,
    location_name: form.location_name.trim() || undefined,
    latitude: form.latitude.trim() ? Number(form.latitude) : undefined,
    longitude: form.longitude.trim() ? Number(form.longitude) : undefined,
    original_image_url: result.original_image_url,
    annotated_image_url: result.annotated_image_url,
    analysis_mode: result.analysis_mode ?? "prototype",
    model_name: result.model_name ?? "yolov8n.pt",
    detections: result.detections,
  };
}
