import { jsPDF } from "jspdf";
import type { BackupJob } from "../types/backup";
import { buildBackupFileName } from "./backupStorage";
import { getBackupStorage, getLatestBackupExecution, resolveBackupInstitution, resolveBackupVerifiedBy } from "./backupHelpers";

const PAGE = { width: 210, height: 297, margin: 7, right: 203, bottom: 290, contentBottom: 258 };
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

function drawLine(pdf: jsPDF, x1: number, y1: number, x2: number, y2: number, width = 0.25): void {
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(width);
  pdf.line(x1, y1, x2, y2);
}

function drawRect(pdf: jsPDF, x: number, y: number, width: number, height: number, lineWidth = 0.25): void {
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(lineWidth);
  pdf.rect(x, y, width, height);
}

function drawHeader(pdf: jsPDF, page: number): number {
  const x = PAGE.margin;
  const y = PAGE.margin;
  const w = PAGE.right - PAGE.margin;
  const stampH = 10;
  const headerY = y + stampH;
  const headerH = 42;
  const logoW = 37;
  const middleW = 102;
  const rightW = w - logoW - middleW;
  drawRect(pdf, x, y, w, PAGE.bottom - y, 0.4);
  pdf.setTextColor(180, 180, 180);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.text("Space for Controlled/ Uncontrolled Stamp", x + 36, y + 6.5, { align: "center" });
  pdf.text("Space for Master Stamp", x + w - 36, y + 6.5, { align: "center" });
  drawRect(pdf, x, y, w, stampH, 0.3);
  drawLine(pdf, x + w / 2, y, x + w / 2, y + stampH, 0.25);
  drawRect(pdf, x, headerY, w, headerH, 0.3);
  drawLine(pdf, x + logoW, headerY, x + logoW, headerY + headerH, 0.25);
  drawLine(pdf, x + logoW + middleW, headerY, x + logoW + middleW, headerY + headerH, 0.25);
  drawLine(pdf, x, headerY + 19, x + logoW, headerY + 19, 0.25);
  drawLine(pdf, x + logoW, headerY + 19, x + logoW + middleW, headerY + 19, 0.25);
  drawLine(pdf, x + logoW + middleW, headerY + 19, x + w, headerY + 19, 0.25);
  const logoPath = new URL("../../../imports/1675064281326.jpeg", import.meta.url).href;
  try {
    pdf.addImage(logoPath, "JPEG", x + 3, headerY + 4, 30, 12);
  } catch {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text("RAJARAM", x + 3, headerY + 11);
    pdf.text("CONSUMER CARE PVT. LTD.", x + 3, headerY + 15);
  }
  pdf.setTextColor(...COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.text("RAJARAM CONSUMER CARE PVT. LTD.", x + logoW + middleW / 2, headerY + 7, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.4);
  pdf.text("Plot No.: A-20/2/1A, MIDC, Islampur, Tal - Walwa,", x + logoW + middleW / 2, headerY + 12, { align: "center" });
  pdf.text("Dist.- Sangli, Maharashtra-415414, India", x + logoW + middleW / 2, headerY + 16, { align: "center" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text(`Page ${page}`, x + logoW + middleW + rightW / 2, headerY + 7, { align: "center" });
  pdf.text("RCC-OMP", x + logoW + middleW + rightW / 2, headerY + 14, { align: "center" });
  pdf.setFontSize(8);
  pdf.text("TITLE:", x + 4, headerY + 27);
  pdf.setFontSize(9);
  pdf.text("BACKUP ACTIVITY REPORT", x + logoW + middleW / 2, headerY + 27, { align: "center" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("Report Type:", x + logoW + middleW + 3, headerY + 26);
  drawLine(pdf, x + logoW + middleW + 3, headerY + 29, x + w - 3, headerY + 29, 0.2);
  pdf.setFont("helvetica", "normal");
  pdf.text("Backup", x + logoW + middleW + 3, headerY + 28);
  pdf.setFontSize(7);
  pdf.text("Annexure No.: RCC-OMP-BKP", x + 2, headerY + headerH + 5);
  drawLine(pdf, x, headerY + headerH + 7, x + w, headerY + headerH + 7, 0.25);
  return headerY + headerH + 14;
}

function drawSectionTitle(pdf: jsPDF, title: string, y: number): number {
  pdf.setFillColor(...COLORS.light);
  pdf.rect(PAGE.margin, y - 5, PAGE.width - PAGE.margin * 2, 7, "F");
  drawRect(pdf, PAGE.margin, y - 5, PAGE.width - PAGE.margin * 2, 7, 0.25);
  pdf.setTextColor(...COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(title.toUpperCase(), PAGE.margin + 2, y);
  return y + 9;
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
  const x = PAGE.margin;
  const w = PAGE.right - PAGE.margin;
  const footerTop = PAGE.bottom - 28;
  drawLine(pdf, x, footerTop, x + w, footerTop, 0.3);
  pdf.setTextColor(...COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.7);
  pdf.text("Department: Backup Operations", x + 2, footerTop + 5);
  pdf.text("Issued by: RCC-OMP", x + w / 2 - 27, footerTop + 5);
  pdf.text("Internal Use Only", x + 2, footerTop + 11);
  pdf.text(`Page ${page} of ${totalPages}`, x + w - 2, footerTop + 11, { align: "right" });
  drawLine(pdf, x, footerTop + 16, x + w, footerTop + 16, 0.25);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("RCC-OMP / Rajaram Consumer Care Pvt. Ltd.", x + 2, footerTop + 23);
  pdf.text("Annexure No.: RCC-OMP-BKP", x + w - 2, footerTop + 23, { align: "right" });
}

export function exportBackupJobPdf(job: BackupJob): void {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const execution = getLatestBackupExecution(job);
  const storage = getBackupStorage(job, execution);
  const institution = resolveBackupInstitution(job, execution);
  const verifiedBy = resolveBackupVerifiedBy(job, execution);
  const completedDate = execution?.completedAt || (job.completionDate && `${job.completionDate} ${execution?.backupTime || ""}`.trim()) || execution?.backupDate;
  const verifiedDate = execution?.verifiedAt || job.completionDate || execution?.backupDate;
  const history = job.history.filter((entry) => entry.status === "Completed");
  let y = drawHeader(pdf, 1);

  const nextPage = (required = 20) => {
    if (y + required <= PAGE.contentBottom) return;
    pdf.addPage();
    y = drawHeader(pdf, pdf.getNumberOfPages());
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
    ["Verified On", formatDateTime(verifiedDate)],
    ["Completed By", execution?.doneBy || job.completedBy || job.user],
    ["Completed On", formatDateTime(completedDate)],
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
  drawRect(pdf, PAGE.margin, y - 5, PAGE.width - PAGE.margin * 2, 7, 0.25);
  xPositions.slice(1).forEach((x) => drawLine(pdf, x, y - 5, x, y + 2, 0.25));
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  columns.forEach((column, index) => pdf.text(column, xPositions[index] + 1, y));
  y += 7;
  for (const entry of history) {
    const details = entry.executionDetails;
    const historyDate = details?.completedAt || entry.date;
    const values = [formatDateTime(historyDate), details?.doneBy || job.completedBy || job.user, details?.verifiedBy || verifiedBy, entry.status, details?.executionNotes || "—"];
    const lineSets = values.map((value, index) => pdf.splitTextToSize(display(value), widths[index] - 2) as string[]);
    const rowHeight = Math.max(...lineSets.map((lines) => lines.length)) * 4.2 + 2;
    nextPage(rowHeight + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...COLORS.text);
    lineSets.forEach((lines, index) => lines.forEach((line, lineIndex) => pdf.text(line, xPositions[index] + 1, y + lineIndex * 4.2)));
    pdf.setDrawColor(205, 205, 205);
    pdf.line(PAGE.margin, y + rowHeight - 2, PAGE.width - PAGE.margin, y + rowHeight - 2);
    xPositions.slice(1).forEach((x) => pdf.line(x, y, x, y + rowHeight - 2));
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
