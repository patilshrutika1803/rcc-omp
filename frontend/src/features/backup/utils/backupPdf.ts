import { jsPDF } from "jspdf";
import type { BackupJob } from "../types/backup";
import { buildBackupFileName } from "./backupStorage";

const RCC_LOGO_PLACEHOLDER = "RCC";

function drawHeader(pdf: jsPDF, job: BackupJob, pageNumber: number): void {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("RAJARAM CONSUMER CARE PVT. LTD.", 105, 20, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Company Address", 105, 28, { align: "center" });
  pdf.text("MASTER COPY", 105, 36, { align: "center" });

  pdf.setFontSize(9);
  pdf.text(`SOP Number: RCC-BKP-001`, 20, 46);
  pdf.text(`Effective Date: 01-01-2026`, 20, 52);
  pdf.text(`Review Date: 01-01-2027`, 20, 58);
  pdf.text(`Page ${pageNumber}`, 190, 58, { align: "right" });

  pdf.setDrawColor(203, 213, 225);
  pdf.line(20, 66, 190, 66);

  pdf.setFillColor(240, 247, 244);
  pdf.roundedRect(20, 72, 170, 16, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Backup Report", 28, 82);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(RCC_LOGO_PLACEHOLDER, 165, 82, { align: "center" });
}

function drawSection(pdf: jsPDF, title: string, items: Array<[string, string]>, startY: number): number {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(title, 20, startY);

  pdf.setDrawColor(226, 232, 240);
  pdf.line(20, startY + 3, 190, startY + 3);

  let y = startY + 12;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  items.forEach(([label, value]) => {
    pdf.setTextColor(71, 85, 105);
    pdf.text(`${label}:`, 24, y);
    pdf.setTextColor(15, 23, 42);
    pdf.text(value || "—", 72, y);
    y += 7;
  });

  return y + 4;
}

function drawFooter(pdf: jsPDF, pageNumber: number): void {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Generated on ${new Date().toLocaleDateString("en-GB")}`, 20, 280);
  pdf.text(`Page ${pageNumber}`, 190, 280, { align: "right" });

  pdf.setFontSize(10);
  pdf.text("Backup Done By", 20, 292);
  pdf.line(20, 300, 70, 300);
  pdf.text("Verified By", 95, 292);
  pdf.line(95, 300, 145, 300);
  pdf.text("Approved By", 170, 292);
  pdf.line(170, 300, 190, 300);

  pdf.text("Department", 20, 312);
  pdf.line(20, 320, 70, 320);
}

export function exportBackupJobPdf(job: BackupJob): void {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageNumber = 1;
  drawHeader(pdf, job, pageNumber);

  const execution = job.history[0]?.executionDetails;
  const backupSize = execution?.backupSize ?? job.sizeGB;
  const backupUnit = execution?.unit || "GB";

  const infoRows: Array<[string, string]> = [
    ["Backup Activity Name", job.name],
    ["Institution Name", execution?.institutionName || job.description || "—"],
    ["System", execution?.system || job.server || "—"],
    ["Department", execution?.department || job.department],
    ["Backup Frequency", execution?.backupFrequency || job.frequency],
    ["Priority", job.priority || "Medium"],
    ["System ID", execution?.systemId || job.id],
    ["Instrument Name", execution?.instrumentName || job.server || "—"],
    ["Backup Date", execution?.backupDate || job.lastBackup || "—"],
    ["Backup Time", execution?.backupTime || job.nextBackup.split(" ")[1] || "—"],
    ["Backup Size", `${backupSize} ${backupUnit}`],
    ["Unit", backupUnit],
    ["Done By", execution?.doneBy || job.user],
    ["Verified By", execution?.verifiedBy || job.lastVerified || "—"],
    ["Execution Notes", execution?.executionNotes || job.description || "—"],
  ];

  const startY = 90;
  drawSection(pdf, "Backup Information", infoRows, startY);
  drawFooter(pdf, pageNumber);

  pdf.save(buildBackupFileName(job));
}
