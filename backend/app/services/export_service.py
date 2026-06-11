"""Export services for council-ready report downloads."""

import csv
from io import BytesIO, StringIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.models.report import Report
from app.services.report_service import derive_overall_severity

DISCLAIMER = (
    "Prototype detection outputs should be reviewed by an authorised officer "
    "before operational decisions are made."
)


def format_optional(value: object) -> str:
    """Return a display-safe value for export output."""
    if value is None:
        return "Not provided"
    return str(value)


def case_summary(report: Report) -> tuple[str, str]:
    """Return recommended priority and suggested action for a report."""
    if not report.detections:
        return (
            "No action required",
            "Retain the record for audit history and continue routine monitoring.",
        )

    severity = derive_overall_severity(report.detections)
    if severity in {"critical", "high"}:
        return (
            "Urgent inspection",
            "Assign an inspector or contractor to verify the issue and prioritise repair planning.",
        )
    if severity == "medium":
        return (
            "Scheduled review",
            "Add this location to the next inspection cycle and compare against network priorities.",
        )
    return ("Monitor", "Review during routine road condition checks.")


def build_pdf_report(report: Report) -> bytes:
    """Generate a professional PDF export for a saved report."""
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
    )
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="PavementaTitle",
            parent=styles["Title"],
            fontSize=22,
            textColor=colors.HexColor("#071624"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading2"],
            fontSize=13,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=12,
            spaceAfter=8,
        )
    )

    priority, action = case_summary(report)
    coordinates = (
        f"{report.latitude:.6f}, {report.longitude:.6f}"
        if report.latitude is not None and report.longitude is not None
        else "Not provided"
    )

    metadata = [
        ["Report public ID", report.public_id],
        ["Report title", report.title],
        ["Location", format_optional(report.location_name)],
        ["Coordinates", coordinates],
        ["Status", report.status.replace("_", " ")],
        ["Overall severity", report.overall_severity],
        ["Road health score", f"{report.road_health_score:.1f}"],
        ["Analysis mode", report.analysis_mode],
        ["Model name", report.model_name],
        ["Created date", report.created_at.strftime("%d %b %Y %H:%M")],
    ]

    detection_rows = [["Label", "Confidence", "Severity", "Bounding box"]]
    for detection in report.detections:
        detection_rows.append(
            [
                detection.label,
                f"{detection.confidence * 100:.0f}%",
                detection.severity,
                f"x1 {detection.x1}, y1 {detection.y1}, x2 {detection.x2}, y2 {detection.y2}",
            ]
        )

    if len(detection_rows) == 1:
        detection_rows.append(["No detections", "0%", "low", "N/A"])

    story = [
        Paragraph("Pavementa", styles["PavementaTitle"]),
        Paragraph("Road Intelligence for Modern Cities", styles["Normal"]),
        Spacer(1, 8),
        Paragraph(f"Council-Ready Infrastructure Report: {report.public_id}", styles["SectionHeading"]),
        Table(metadata, colWidths=[45 * mm, 112 * mm]),
        Paragraph("Case Summary", styles["SectionHeading"]),
        Paragraph(f"<b>Damage count:</b> {len(report.detections)}", styles["Normal"]),
        Paragraph(f"<b>Highest severity:</b> {report.overall_severity}", styles["Normal"]),
        Paragraph(f"<b>Recommended priority:</b> {priority}", styles["Normal"]),
        Paragraph(f"<b>Suggested action:</b> {action}", styles["Normal"]),
        Paragraph("Detection Table", styles["SectionHeading"]),
        Table(detection_rows, colWidths=[36 * mm, 32 * mm, 32 * mm, 62 * mm]),
        Paragraph("Disclaimer", styles["SectionHeading"]),
        Paragraph(DISCLAIMER, styles["Normal"]),
    ]

    for item in story:
        if isinstance(item, Table):
            item.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cbd5e1")),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 8),
                        ("LEFTPADDING", (0, 0), (-1, -1), 6),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )

    document.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def build_csv_report(report: Report) -> str:
    """Generate a CSV export with metadata rows and detection rows."""
    output = StringIO()
    writer = csv.writer(output)
    priority, action = case_summary(report)
    coordinates = (
        f"{report.latitude:.6f}, {report.longitude:.6f}"
        if report.latitude is not None and report.longitude is not None
        else "Not provided"
    )

    writer.writerow(["Pavementa report metadata"])
    writer.writerow(["public_id", report.public_id])
    writer.writerow(["title", report.title])
    writer.writerow(["location", format_optional(report.location_name)])
    writer.writerow(["coordinates", coordinates])
    writer.writerow(["status", report.status])
    writer.writerow(["overall_severity", report.overall_severity])
    writer.writerow(["road_health_score", f"{report.road_health_score:.1f}"])
    writer.writerow(["analysis_mode", report.analysis_mode])
    writer.writerow(["model_name", report.model_name])
    writer.writerow(["created_at", report.created_at.isoformat()])
    writer.writerow(["damage_count", len(report.detections)])
    writer.writerow(["recommended_priority", priority])
    writer.writerow(["suggested_action", action])
    writer.writerow(["disclaimer", DISCLAIMER])
    writer.writerow([])
    writer.writerow(["detections"])
    writer.writerow(["label", "confidence", "severity", "x1", "y1", "x2", "y2"])

    for detection in report.detections:
        writer.writerow(
            [
                detection.label,
                f"{detection.confidence:.4f}",
                detection.severity,
                detection.x1,
                detection.y1,
                detection.x2,
                detection.y2,
            ]
        )

    return output.getvalue()

