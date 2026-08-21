import { jsPDF } from "jspdf";
import type { BackupJob } from "../types/backup";
import { buildBackupFileName } from "./backupStorage";
import { getBackupStorage, getLatestBackupExecution, resolveBackupInstitution, resolveBackupVerifiedBy } from "./backupHelpers";

const PAGE = { width: 210, height: 297, margin: 7, contentBottom: 274 };
const COLORS = {
  border: [85, 85, 85] as [number, number, number],
  light: [235, 235, 235] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  muted: [110, 110, 110] as [number, number, number],
};

function display(value: unknown): string {
  if (value === undefined || value === null) return "—";
  const text = String(value).trim();
  return text && text !== "—" && text !== "undefined" && text !== "null" ? text : "—";
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const datePart = value.split("T")[0].split(" ")[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? display(value) : parsed.toLocaleDateString("en-GB").replace(/\//g, "-");
}

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const time = value.includes("T") ? value.split("T")[1]?.slice(0, 5) : value.split(" ")[1]?.slice(0, 5);
  return `${formatDate(value)}${time ? ` ${time}` : ""}`;
}

function drawHeader(pdf: jsPDF): number {
  const center = PAGE.width / 2;
  pdf.setTextColor(...COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("RAJARAM CONSUMER CARE PVT. LTD.", center, 15, { align: "center" });
  pdf.setFontSize(9);
  pdf.text("RCC OPERATIONAL MANAGEMENT PORTAL", center, 21, { align: "center" });
  pdf.setFontSize(12);
  pdf.text("BACKUP ACTIVITY REPORT", center, 30, { align: "center" });
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, 35, PAGE.width - PAGE.margin, 35);
  return 43;
}

function drawSectionTitle(pdf: jsPDF, title: string, y: number): number {
  pdf.setFillColor(...COLORS.light);
  pdf.rect(PAGE.margin, y - 5, PAGE.width - PAGE.margin * 2, 7, "F");
  pdf.setTextColor(...COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(title.toUpperCase(), PAGE.margin + 2, y);
  return y + 8;
}

function drawInfoRows(pdf: jsPDF, rows: Array<[string, string]>, y: number): number {
  const labelX = PAGE.margin + 2;
  const valueX = 70;
  for (const [label, rawValue] of rows) {
    const value = display(rawValue);
    const lines = pdf.splitTextToSize(value, PAGE.width - valueX - PAGE.margin - 2) as string[];
    const rowHeight = Math.max(6, lines.length * 4.2);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.text);
    pdf.text(`${label}:`, labelX, y);
    pdf.setFont("helvetica", "normal");
    lines.forEach((line, index) => pdf.text(line, valueX, y + index * 4.2));
    pdf.setDrawColor(205, 205, 205);
    pdf.setLineWidth(0.15);
    pdf.line(PAGE.margin, y + rowHeight - 2, PAGE.width - PAGE.margin, y + rowHeight - 2);
    y += rowHeight;
  }
  return y + 3;
}

function drawFooter(pdf: jsPDF, page: number, totalPages: number): void {
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.3);
  pdf.line(PAGE.margin, 279, PAGE.width - PAGE.margin, 279);
  pdf.setTextColor(...COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text("RCC-OMP / Rajaram Consumer Care Pvt. Ltd.", PAGE.margin, 285);
  pdf.text("Internal Use Only", PAGE.width / 2, 285, { align: "center" });
  pdf.text(`Page ${page} of ${totalPages}`, PAGE.width - PAGE.margin, 285, { align: "right" });
}

export function exportBackupJobPdf(job: BackupJob): void {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const execution = getLatestBackupExecution(job);
  const storage = getBackupStorage(job, execution);
  const institution = resolveBackupInstitution(job, execution);
  const verifiedBy = resolveBackupVerifiedBy(job, execution);
  const completedAt = execution?.completedAt || (job.completionDate && `${job.completionDate} ${execution?.backupTime || ""}`.trim());
  const verifiedAt = execution?.verifiedAt || completedAt;
  const history = job.history.filter((entry) => entry.status === "Completed");
  let y = drawHeader(pdf);

  const nextPage = (required = 20) => {
    if (y + required <= PAGE.contentBottom) return;
    pdf.addPage();
    y = drawHeader(pdf);
  };
  const section = (title: string, rows: Array<[string, string]>) => {
    nextPage(16 + rows.length * 7);
    y = drawSectionTitle(pdf, title, y);
    y = drawInfoRows(pdf, rows, y);
  };

  section("Job Information", [
    ["Job Name", job.name],
    ["Department", job.department],
    ["Institution", institution],
    ["Frequency", job.frequency],
    ["Reminder", job.reminder || "—"],
    ["Priority", job.priority || "Medium"],
    ["Status", job.status],
    ["Due Date", formatDate(job.dueDate || job.nextDueDate)],
  ]);

  section("Backup Execution Details", [
    ["Last Verified", verifiedBy],
    ["Verified On", formatDateTime(verifiedAt)],
    ["Completed By", execution?.doneBy || job.completedBy || job.user],
    ["Completed On", formatDateTime(completedAt || execution?.backupDate)],
  ]);

  nextPage(35);
  y = drawSectionTitle(pdf, "Storage Information", y);
  y = drawInfoRows(pdf, [
    ["Storage Used", `${display(storage.used)} ${storage.unit}`],
    ["Storage Quota", `${display(storage.quotaGB)} GB`],
    ["Storage Remaining", `${display(storage.remainingGB)} GB`],
    ["Storage Usage", `${storage.percentage}%`],
  ], y);
  pdf.setDrawColor(...COLORS.border);
  pdf.rect(PAGE.margin + 2, y, PAGE.width - PAGE.margin * 2 - 4, 4);
  pdf.setFillColor(16, 185, 129);
  pdf.rect(PAGE.margin + 2, y, (PAGE.width - PAGE.margin * 2 - 4) * storage.percentage / 100, 4, "F");
  y += 11;

  nextPage(30);
  y = drawSectionTitle(pdf, "Completion Notes / Findings", y);
  y = drawInfoRows(pdf, [["Notes", execution?.executionNotes || job.completionNotes || job.completionRemarks || job.notes || "—"]], y);

  nextPage(28);
  y = drawSectionTitle(pdf, "Backup History", y);
  const columns = ["Date", "Completed By", "Verified By", "Status", "Notes"];
  const widths = [27, 32, 32, 22, 83];
  const xPositions = widths.reduce<number[]>((positions, width, index) => {
    positions.push((positions[index - 1] ?? PAGE.margin) + (index === 0 ? 0 : widths[index - 1]));
    return positions;
  }, []);
  pdf.setFillColor(...COLORS.light);
  pdf.rect(PAGE.margin, y - 5, PAGE.width - PAGE.margin * 2, 7, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  columns.forEach((column, index) => pdf.text(column, xPositions[index] + 1, y));
  y += 7;
  for (const entry of history) {
    const details = entry.executionDetails;
    const values = [formatDateTime(entry.date), details?.doneBy || job.completedBy || job.user, details?.verifiedBy || verifiedBy, entry.status, details?.executionNotes || "—"];
    const lineSets = values.map((value, index) => pdf.splitTextToSize(display(value), widths[index] - 2) as string[]);
    const rowHeight = Math.max(...lineSets.map((lines) => lines.length)) * 4.2 + 2;
    nextPage(rowHeight + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...COLORS.text);
    lineSets.forEach((lines, index) => lines.forEach((line, lineIndex) => pdf.text(line, xPositions[index] + 1, y + lineIndex * 4.2)));
    pdf.setDrawColor(205, 205, 205);
    pdf.line(PAGE.margin, y + rowHeight - 2, PAGE.width - PAGE.margin, y + rowHeight - 2);
    y += rowHeight;
  }
  if (history.length === 0) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("No completed execution history recorded.", PAGE.margin + 2, y);
  }

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    drawFooter(pdf, page, totalPages);
  }
  pdf.setProperties({ title: "Backup Activity Report", subject: "RCC-OMP Backup Activity", author: "Rajaram Consumer Care Pvt. Ltd.", creator: "RCC-OMP" });
  pdf.save(buildBackupFileName(job));
}
