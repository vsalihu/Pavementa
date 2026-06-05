"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  FileImage,
  Loader2,
  MapPin,
  SearchCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SeverityBadge } from "@/components/SeverityBadge";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type UploadResponse = {
  message: string;
  filename: string;
  file_url: string;
  content_type: string;
  size_bytes: number;
};

type DetectionResponse = {
  message: string;
  mode: string;
  note: string;
  original_image_url: string;
  annotated_image_url: string;
  detections: Array<{
    label: string;
    confidence: number;
    box: { x1: number; y1: number; x2: number; y2: number };
    severity: "low" | "medium" | "high";
  }>;
  summary: {
    total_detections: number;
    highest_confidence: number;
    overall_severity: "low" | "medium" | "high";
  };
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [detectionResult, setDetectionResult] =
    useState<DetectionResponse | null>(null);

  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function setPreviewForFile(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
  }

  function validateAndSelectFile(file: File) {
    setError(null);
    setUploadResult(null);
    setDetectionResult(null);
    setProgress(0);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setPreviewForFile(null);
      setError("Upload a valid JPG, JPEG, PNG, or WEBP road image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setPreviewForFile(null);
      setError("Image exceeds the 10MB upload limit.");
      return;
    }

    setSelectedFile(file);
    setPreviewForFile(file);
  }

  function handleFileInput(files: FileList | null) {
    const file = files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  }

  function sendImageRequest<TResponse>({
    endpoint,
    onComplete,
    setLoading,
  }: {
    endpoint: string;
    onComplete: (response: TResponse) => void;
    setLoading: (loading: boolean) => void;
  }) {
    if (!selectedFile) {
      setError("Select a road image before starting.");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const request = new XMLHttpRequest();
    request.open("POST", `${apiUrl.replace(/\/$/, "")}${endpoint}`);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      setLoading(false);

      try {
        const response = JSON.parse(request.responseText);

        if (request.status >= 200 && request.status < 300) {
          setProgress(100);
          onComplete(response);
          return;
        }

        setError(response.detail ?? "Request failed. Check the file and try again.");
      } catch {
        setError("Request failed. The backend returned an unexpected response.");
      }
    };

    request.onerror = () => {
      setLoading(false);
      setError("Request failed. Confirm the FastAPI backend is running.");
    };

    request.send(formData);
  }

  function uploadImage() {
    setDetectionResult(null);
    sendImageRequest<UploadResponse>({
      endpoint: "/api/uploads/image",
      setLoading: setIsUploading,
      onComplete: setUploadResult,
    });
  }

  function analyseImage() {
    setUploadResult(null);
    sendImageRequest<DetectionResponse>({
      endpoint: "/api/detections/analyse-image",
      setLoading: setIsAnalysing,
      onComplete: setDetectionResult,
    });
  }

  const isBusy = isUploading || isAnalysing;

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Upload road imagery
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload inspection images for storage or run prototype YOLO analysis
            before the road-damage model is fine-tuned.
          </p>

          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Prototype detection mode: using a general pretrained model before
            road-damage fine-tuning.
          </div>

          <div
            className={`mt-6 flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center transition ${
              isDragging
                ? "border-infrastructure-green bg-emerald-50"
                : "border-slate-300 bg-slate-50"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFileInput(event.dataTransfer.files);
            }}
          >
            {previewUrl && selectedFile ? (
              <div className="w-full max-w-xl">
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <Image
                    alt="Selected road inspection preview"
                    className="object-cover"
                    fill
                    src={previewUrl}
                    unoptimized
                  />
                </div>
                <div className="mt-4 flex flex-col justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 text-left sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <FileImage
                      aria-hidden="true"
                      className="h-5 w-5 text-infrastructure-green"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {selectedFile.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    disabled={isBusy}
                    onClick={() => inputRef.current?.click()}
                    variant="secondary"
                  >
                    Change image
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-md bg-white p-4 text-infrastructure-green shadow-sm">
                  <UploadCloud aria-hidden="true" className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-950">
                  Drag and drop a road image here
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Accepted formats: JPG, JPEG, PNG, and WEBP. Maximum file size:
                  10MB.
                </p>
                <Button
                  className="mt-6"
                  onClick={() => inputRef.current?.click()}
                  variant="secondary"
                >
                  Select image
                </Button>
              </>
            )}
            <input
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => handleFileInput(event.target.files)}
              ref={inputRef}
              type="file"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Inspection metadata
          </h2>
          <label
            className="mt-6 block text-sm font-semibold text-slate-700"
            htmlFor="location"
          >
            Location reference
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
            <MapPin aria-hidden="true" className="h-4 w-4 text-slate-400" />
            <input
              className="h-11 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400"
              id="location"
              placeholder="Example: A41 Northbound, Sector 4"
              type="text"
            />
          </div>

          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Prototype analysis
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This stores the original image, runs a pretrained YOLO model, and
              returns an annotated image. No database record is created yet.
            </p>
          </div>

          {isBusy ? (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  {isAnalysing ? "Analysing image" : "Uploading image"}
                </span>
                <span className="text-slate-500">{progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-infrastructure-green transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
              <XCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm leading-6">{error}</p>
            </div>
          ) : null}

          {uploadResult ? (
            <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <div className="flex gap-3">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold">{uploadResult.message}</p>
                  <p className="mt-2 break-all text-sm leading-6">
                    Stored as {uploadResult.filename}
                  </p>
                  <a
                    className="mt-2 inline-block text-sm font-semibold underline"
                    href={uploadResult.file_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open uploaded image
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button disabled={isBusy || !selectedFile} onClick={uploadImage}>
              {isUploading ? (
                <>
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                "Upload image"
              )}
            </Button>
            <Button
              disabled={isBusy || !selectedFile}
              onClick={analyseImage}
              variant="secondary"
            >
              {isAnalysing ? (
                <>
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Analysing
                </>
              ) : (
                <>
                  <SearchCheck aria-hidden="true" className="h-4 w-4" />
                  Upload and Analyse
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {detectionResult ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Detection review
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {detectionResult.note}
                </p>
              </div>
              <SeverityBadge
                severity={detectionResult.summary.overall_severity}
              />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Original image
                </p>
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <Image
                    alt="Original uploaded detection image"
                    className="object-cover"
                    fill
                    src={detectionResult.original_image_url}
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
                    alt="Annotated YOLO detection image"
                    className="object-cover"
                    fill
                    src={detectionResult.annotated_image_url}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Detection summary
            </h2>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Total</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {detectionResult.summary.total_detections}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Highest</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {(detectionResult.summary.highest_confidence * 100).toFixed(0)}
                  %
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Severity</p>
                <div className="mt-2">
                  <SeverityBadge
                    severity={detectionResult.summary.overall_severity}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {detectionResult.detections.length > 0 ? (
                detectionResult.detections.map((item, index) => (
                  <div
                    className="rounded-md border border-slate-200 p-4"
                    key={`${item.label}-${index}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold capitalize text-slate-950">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Confidence {(item.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <SeverityBadge severity={item.severity} />
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Box: x1 {item.box.x1}, y1 {item.box.y1}, x2 {item.box.x2},
                      y2 {item.box.y2}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  No objects were detected by the prototype model in this image.
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}

