"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileImage,
  Loader2,
  MapPin,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ErrorState } from "@/components/ErrorState";
import { FormField } from "@/components/FormField";
import { TextArea } from "@/components/TextArea";
import type { DetectionResult, DetectionSeverity } from "@/lib/detection-result";

type CitizenForm = {
  citizen_name: string;
  citizen_email: string;
  location_name: string;
  latitude: string;
  longitude: string;
  citizen_description: string;
};

type SaveReportResponse = {
  public_id: string;
};

const priorityBySeverity: Record<DetectionSeverity, string> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "urgent",
};

function toOptionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PublicReportPage() {
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    []
  );
  const [form, setForm] = useState<CitizenForm>({
    citizen_name: "",
    citizen_email: "",
    location_name: "",
    latitude: "",
    longitude: "",
    citizen_description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  function updateField(field: keyof CitizenForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setSelectedFile(nextFile: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(nextFile);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.location_name.trim()) {
      setError("Enter the road or location name before submitting.");
      return;
    }

    if (!file) {
      setError("Upload a road damage image before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanApiUrl = apiUrl.replace(/\/$/, "");
      const imageFormData = new FormData();
      imageFormData.append("file", file);

      const detectionResponse = await fetch(
        `${cleanApiUrl}/api/detections/analyse-image`,
        {
          method: "POST",
          body: imageFormData,
        }
      );
      const detectionResult = (await detectionResponse.json()) as DetectionResult & {
        detail?: string;
      };

      if (!detectionResponse.ok) {
        throw new Error(
          detectionResult.detail ?? "The image could not be analysed."
        );
      }

      const overallSeverity = detectionResult.summary.overall_severity;
      const reportResponse = await fetch(`${cleanApiUrl}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Citizen road damage report - ${form.location_name.trim()}`,
          location_name: form.location_name.trim(),
          latitude: toOptionalNumber(form.latitude),
          longitude: toOptionalNumber(form.longitude),
          status: "open",
          priority: priorityBySeverity[overallSeverity],
          source: "citizen",
          citizen_name: form.citizen_name.trim() || undefined,
          citizen_email: form.citizen_email.trim() || undefined,
          citizen_description: form.citizen_description.trim() || undefined,
          original_image_url: detectionResult.original_image_url,
          annotated_image_url: detectionResult.annotated_image_url,
          analysis_mode: detectionResult.analysis_mode ?? "prototype",
          model_name: detectionResult.model_name ?? "yolov8n.pt",
          detections: detectionResult.detections,
        }),
      });
      const reportResult = (await reportResponse.json()) as SaveReportResponse & {
        detail?: string;
      };

      if (!reportResponse.ok) {
        throw new Error(reportResult.detail ?? "The report could not be saved.");
      }

      setSubmittedId(reportResult.public_id);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The report could not be submitted. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedId) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-infrastructure-green">
              <CheckCircle2 aria-hidden="true" className="h-7 w-7" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-infrastructure-green">
              Report submitted
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              {submittedId}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Your report has been submitted for review.
            </p>
            <div className="mx-auto mt-6 max-w-md rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-sm leading-6 text-slate-600">
              Keep this reference number for updates. The public tracking page
              only shows safe status information and does not display officer
              notes or personal contact details.
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href={`/public/track/${submittedId}`}>
                Track report
              </Button>
              <Button href="/public/report" variant="secondary">
                Submit another report
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link className="text-lg font-semibold text-slate-950" href="/">
            Pavementa
          </Link>
          <Link
            className="text-sm font-semibold text-infrastructure-green hover:text-[#17794f]"
            href="/public/track"
          >
            Track a report
          </Link>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-infrastructure-green">
                Public road damage reporting
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Report a road issue for council review
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Upload a clear image, add the road location, and Pavementa will
                create a review case for the relevant authority.
              </p>
            </div>

            <Card className="p-5">
              <div className="flex gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-1 h-5 w-5 shrink-0 text-infrastructure-green"
                />
                <p className="text-sm leading-6 text-slate-600">
                  Your report will be reviewed by the relevant authority.
                  Personal details are optional and used only for follow-up.
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-base font-semibold text-slate-950">
                What happens next
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <div className="flex gap-3">
                  <FileImage className="mt-1 h-4 w-4 text-slate-500" />
                  The image is checked using prototype detection.
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-slate-500" />
                  Your location details help officers place the issue.
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 text-slate-500" />
                  You receive a public reference number for tracking.
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-5 sm:p-6">
            <form className="space-y-5" onSubmit={submitReport}>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Submit road damage report
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Required fields are marked clearly. Personal details are
                  optional.
                </p>
              </div>

              <FormField
                label="Road or location name"
                onChange={(event) =>
                  updateField("location_name", event.target.value)
                }
                placeholder="Example: High Street near library"
                required
                value={form.location_name}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  inputMode="decimal"
                  label="Latitude"
                  onChange={(event) => updateField("latitude", event.target.value)}
                  placeholder="Optional"
                  value={form.latitude}
                />
                <FormField
                  inputMode="decimal"
                  label="Longitude"
                  onChange={(event) =>
                    updateField("longitude", event.target.value)
                  }
                  placeholder="Optional"
                  value={form.longitude}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Full name"
                  onChange={(event) =>
                    updateField("citizen_name", event.target.value)
                  }
                  placeholder="Optional"
                  value={form.citizen_name}
                />
                <FormField
                  label="Email"
                  onChange={(event) =>
                    updateField("citizen_email", event.target.value)
                  }
                  placeholder="Optional"
                  type="email"
                  value={form.citizen_email}
                />
              </div>

              <TextArea
                label="Damage description"
                onChange={(event) =>
                  updateField("citizen_description", event.target.value)
                }
                placeholder="Optional details such as lane, direction, or hazard context"
                value={form.citizen_description}
              />

              <div
                className={`rounded-lg border-2 border-dashed p-4 transition ${
                  isDragging
                    ? "border-infrastructure-green bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  setSelectedFile(event.dataTransfer.files[0] ?? null);
                }}
              >
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
                  <UploadCloud
                    aria-hidden="true"
                    className="h-8 w-8 text-infrastructure-green"
                  />
                  <span className="text-sm font-semibold text-slate-950">
                    Upload a road damage image
                  </span>
                  <span className="text-xs leading-5 text-slate-500">
                    JPG, JPEG, PNG, or WEBP. Image is required.
                  </span>
                  <input
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleFileInput}
                    required
                    type="file"
                  />
                </label>
              </div>

              {file && previewUrl ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-slate-100">
                    <Image
                      alt="Selected road damage"
                      className="object-cover"
                      fill
                      src={previewUrl}
                      unoptimized
                    />
                  </div>
                  <div className="mt-3 flex flex-col justify-between gap-1 text-sm sm:flex-row">
                    <span className="font-semibold text-slate-950">{file.name}</span>
                    <span className="text-slate-500">{formatFileSize(file.size)}</span>
                  </div>
                </div>
              ) : null}

              {error ? (
                <ErrorState message={error} title="Report could not be submitted" />
              ) : null}

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                    Submitting report
                  </>
                ) : (
                  "Submit road damage report"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}
