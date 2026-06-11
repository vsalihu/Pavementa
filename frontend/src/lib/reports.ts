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
  latitude: number | null;
  longitude: number | null;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  source: "internal" | "citizen";
  assigned_to: string | null;
  reviewed_by: string | null;
  scheduled_repair_date: string | null;
  resolved_at: string | null;
  overall_severity: "low" | "medium" | "high" | "critical";
  road_health_score: number;
  analysis_mode: string;
  model_name: string;
  created_at: string;
};

export type ReportRead = ReportListItem & {
  original_image_url: string;
  annotated_image_url: string;
  review_notes: string | null;
  citizen_name: string | null;
  citizen_email: string | null;
  citizen_description: string | null;
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
  case_events: Array<{
    id: number;
    event_type: string;
    message: string;
    created_by: string | null;
    created_at: string;
  }>;
};

export type ReportCaseUpdate = {
  status?: string;
  priority?: string;
  assigned_to?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  scheduled_repair_date?: string | null;
  resolved_at?: string | null;
};

export type ReportSortValue =
  | "newest"
  | "oldest"
  | "road_health_asc"
  | "road_health_desc";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatStatus(value: string) {
  return value === "all" ? "all" : value.replaceAll("_", " ");
}

export function formatConfidence(confidence: number) {
  return `${(confidence * 100).toFixed(0)}%`;
}

export function getCaseRecommendation(report: ReportRead) {
  if (report.detections.length === 0) {
    return {
      priority: "No action required",
      action: "Keep the record for audit history and continue routine monitoring.",
    };
  }

  if (report.overall_severity === "critical" || report.overall_severity === "high") {
    return {
      priority: "Urgent inspection",
      action: "Assign an inspector or contractor to verify the issue and prioritise repair planning.",
    };
  }

  if (report.overall_severity === "medium") {
    return {
      priority: "Scheduled review",
      action: "Add this location to the next inspection cycle and compare against network priorities.",
    };
  }

  return {
    priority: "Monitor",
    action: "Retain the report and monitor during routine road condition checks.",
  };
}

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
