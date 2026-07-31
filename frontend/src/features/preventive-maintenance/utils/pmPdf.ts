import { jsPDF } from "jspdf";
import type { PMChecklistItem, PMRecord } from "../types/pm";
import { SOP_CHECKLIST } from "../constants/pmConstants";
import { formatDate } from "./pmDateUtils";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function drawFooter(pdf: jsPDF, pageNumber: number) {
  const y = PAGE_HEIGHT - 14;
  pdf.setDrawColor(148, 163, 184);
  pdf.line(MARGIN, y - 4, PAGE_WIDTH - MARGIN, y - 4);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105);
  pdf.text("Annexure: Preventive Maintenance Checklist", MARGIN, y);
  pdf.text("Reference: RCC IT Preventive Maintenance SOP", PAGE_WIDTH / 2, y, { align: "center" });
  pdf.text(`Page ${pageNumber}`, PAGE_WIDTH - MARGIN, y, { align: "right" });
}

function drawHeader(pdf: jsPDF, record: PMRecord, pageNumber: number) {
  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(0.35);
  pdf.rect(MARGIN, 12, CONTENT_WIDTH, 36);
  pdf.rect(MARGIN, 12, 26, 36);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(15, 23, 42);
  pdf.text("RCC", MARGIN + 13, 29, { align: "center" });
  pdf.setFontSize(5.5);
  pdf.text("LOGO", MARGIN + 13, 36, { align: "center" });
  pdf.setFontSize(10);
  pdf.text("RAJARAM CONSUMER CARE PVT. LTD.", MARGIN + 30, 20);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text("RCC Operational Maintenance Management", MARGIN + 30, 25);
  pdf.text("Company Address: Rajaram Consumer Care Pvt. Ltd.", MARGIN + 30, 30);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.rect(PAGE_WIDTH - MARGIN - 28, 15, 24, 10);
  pdf.text("MASTER COPY", PAGE_WIDTH - MARGIN - 16, 21, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.text("SOP No.: RCC-IT-PM-01", MARGIN + 30, 39);
  pdf.text(`Effective Date: ${formatDate(record.completionDate || record.nextDue)}`, MARGIN + 75, 39);
  pdf.text(`Review Date: ${formatDate(record.nextDue)}`, MARGIN + 135, 39);
  pdf.text(`Page ${pageNumber}`, PAGE_WIDTH - MARGIN - 16, 31, { align: "center" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("PREVENTIVE MAINTENANCE CHECKLIST", PAGE_WIDTH / 2, 58, { align: "center" });
}

function addPage(pdf: jsPDF, record: PMRecord, pageNumber: number) {
  pdf.addPage();
  drawHeader(pdf, record, pageNumber);
  drawFooter(pdf, pageNumber);
  return 68;
}

export function exportPMChecklistPdf(
  record: PMRecord,
  items: PMChecklistItem[] = record.checklistResponses || [],
  notes = record.completionNotes || "",
) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const checklist = SOP_CHECKLIST.map(item => {
    const response = items.find(saved => saved.number === item.number || saved.label === item.label);
    return { ...item, observation: response?.observation || "" };
  });
  let pageNumber = 1;
  let y = 68;
  drawHeader(pdf, record, pageNumber);
  drawFooter(pdf, pageNumber);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42);
  pdf.text("PM DETAILS", MARGIN, y);
  y += 5;
  const completedDueDate = record.status === "Completed" ? record.lastMaintenance || record.nextDue : record.nextDue;
  const scheduledNextDueDate = record.scheduledNextDue || record.nextDue;
  const details = [
    [record.status === "Completed" ? "Completed PM Due Date" : "Due Date of Preventive Maintenance", formatDate(completedDueDate)],
    ["Next Scheduled Due Date", formatDate(scheduledNextDueDate)],
    ["PM Name", record.machine || record.systemName || record.description || ""],
    ["Department Name", record.department],
    ["Frequency", record.frequency],
    ["Priority", record.priority],
    ["Assigned User", record.user || record.assignedUser],
    ["Preventive Maintenance Performed On", formatDate(record.completionDate || "")],
    ["Last PM / Previous Due Date", formatDate(record.lastMaintenance || record.nextDue)],
    ["System Code", record.systemId || record.machineId],
    ["Machine Name", record.machine || record.systemName],
    ["Machine ID", record.machineId],
  ];
  pdf.setFontSize(7);
  details.forEach(([label, value], index) => {
    const column = index % 2;
    const x = MARGIN + column * 91;
    if (column === 0 && index > 0) y += 7;
    pdf.setFont("helvetica", "bold");
    pdf.text(`${label}:`, x, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(value || ""), x + 43, y);
  });
  y += 9;

  const columns = [MARGIN, MARGIN + 18, MARGIN + 143, PAGE_WIDTH - MARGIN];
  const drawRow = (number: string, activity: string, observation: string, header = false) => {
    const activityLines = pdf.splitTextToSize(activity, 120);
    const observationLines = pdf.splitTextToSize(observation || "", 63);
    const height = header ? 8 : Math.max(10, Math.max(activityLines.length, observationLines.length) * 4 + 5);
    if (!header && y + height > PAGE_HEIGHT - 25) {
      pageNumber += 1;
      y = addPage(pdf, record, pageNumber);
    }
    pdf.setFont("helvetica", header ? "bold" : "normal");
    pdf.setFontSize(header ? 7 : 7.5);
    pdf.setTextColor(15, 23, 42);
    for (let index = 0; index < 3; index += 1) {
      pdf.rect(columns[index], y, columns[index + 1] - columns[index], height);
    }
    pdf.text(number, columns[0] + 2, y + 5);
    pdf.text(activityLines, columns[1] + 2, y + 5);
    pdf.text(observationLines, columns[2] + 2, y + 5);
    y += height;
  };

  drawRow("Sr. No.", "Execution Activity", "Observation", true);
  checklist.forEach(item => drawRow(item.number, item.label, item.observation));
  y += 8;
  if (y + 70 > PAGE_HEIGHT - 25) {
    pageNumber += 1;
    y = addPage(pdf, record, pageNumber);
  }
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("SIGNATURES AND CONTROL", MARGIN, y);
  y += 8;
  const signatures: Array<[string, number]> = [
    ["Preventive Maintenance Done By (Sign & Date)", 110],
    ["Preventive Maintenance Reviewed By (Sign & Date)", 110],
    ["Department", 55],
    ["Issued By (Sign & Date)", 110],
    ["Copy No.", 55],
    ["Authorized By Head QA (Sign & Date)", 110],
  ];
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  signatures.forEach(([label, lineWidth]) => {
    pdf.text(label, MARGIN, y);
    pdf.line(MARGIN + 58, y + 1, MARGIN + 58 + lineWidth, y + 1);
    y += 9;
  });
  if (notes.trim()) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Completion Details / Remarks", MARGIN, y + 3);
    pdf.setFont("helvetica", "normal");
    pdf.text(pdf.splitTextToSize(notes, CONTENT_WIDTH), MARGIN, y + 8);
  }
  pdf.save(`preventive-maintenance-${record.machineId || record.id}-${record.completionDate || record.lastMaintenance || record.nextDue || "report"}.pdf`);
}