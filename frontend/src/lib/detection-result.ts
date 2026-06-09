export const DETECTION_RESULT_STORAGE_KEY = "pavementa:lastDetectionResult";

export type DetectionSeverity = "low" | "medium" | "high" | "critical";

export type DetectionResult = {
  message: string;
  mode: string;
  analysis_mode?: string;
  model_name?: string;
  note: string;
  original_image_url: string;
  annotated_image_url: string;
  detections: Array<{
    label: string;
    confidence: number;
    box: { x1: number; y1: number; x2: number; y2: number };
    severity: DetectionSeverity;
  }>;
  summary: {
    total_detections: number;
    highest_confidence: number;
    overall_severity: DetectionSeverity;
  };
};
