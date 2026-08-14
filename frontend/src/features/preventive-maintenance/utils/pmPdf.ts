import { jsPDF } from "jspdf";
import type { PMChecklistItem, PMRecord } from "../types/pm";
import { SOP_CHECKLIST } from "../constants/pmConstants";
import { formatDate } from "./pmDateUtils";

type PMChecklistDisplayItem = {
  number: string;
  activity: string;
  observation?: string;
  status?: "Completed" | "Not Required" | string;
};

type PMPdfData = {
  dueDate?: string;
  completedDate?: string;
  department?: string;
  systemCode?: string;
  performedBy?: string;
  performedByDate?: string;
  reviewedBy?: string;
  reviewedByDate?: string;
  effectiveDate?: string;
  reviewDate?: string;
  issuedBy?: string;
  issuedByDate?: string;
  copyNo?: string;
  authorizedByQA?: string;
  authorizedByQADate?: string;
  checklist?: PMChecklistDisplayItem[];
  completionNotes?: string;
};

const COMPANY = {
  name: "RAJARAM CONSUMER CARE PVT. LTD.",
  line1: "Plot No.: A-20/2/1A, MIDC, Islampur, Tal - Walwa,",
  line2: "Dist.- Sangli, Maharashtra-415414, India",
  sopNo: "ITD001-01",
  title: "PREVENTIVE MAINTENANCE CHECKLIST",
  annexure: "ITD001-F02-01",
};

const PAGE = {
  width: 210,
  height: 297,
  margin: 7,
  right: 203,
  bottom: 290,
};

const COLORS = {
  border: [85, 85, 85] as [number, number, number],
  lightGray: [235, 235, 235] as [number, number, number],
  mediumGray: [190, 190, 190] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  muted: [110, 110, 110] as [number, number, number],
};

function drawLine(
  pdf: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width = 0.25,
) {
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(width);
  pdf.line(x1, y1, x2, y2);
}

function drawRect(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  width = 0.25,
) {
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(width);
  pdf.rect(x, y, w, h);
}

function fitText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  fontSize: number,
  bold = false,
) {
  pdf.setFont("helvetica", bold ? "bold" : "normal");
  pdf.setFontSize(fontSize);
  pdf.setTextColor(...COLORS.text);

  const lines = pdf.splitTextToSize(text || "", maxWidth);

  lines.forEach((line: string, index: number) => {
    pdf.text(line, x, y + index * lineHeight);
  });

  return lines.length;
}

function drawLabelLine(
  pdf: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.2);
  pdf.setTextColor(...COLORS.text);
  pdf.text(label, x, y);

  const labelWidth = pdf.getTextWidth(label);

  pdf.setFont("helvetica", "normal");
  pdf.text(value || "", x + labelWidth + 2, y);

  drawLine(
    pdf,
    x + labelWidth + 2,
    y + 1.2,
    x + width,
    y + 1.2,
    0.2,
  );
}

function addRccLogo(pdf: jsPDF, x: number, y: number, w: number, h: number) {
  const logoPath = new URL("../../../imports/1675064281326.jpeg", import.meta.url).href;

  try {
    pdf.addImage(logoPath, "JPEG", x, y, w, h);
  } catch {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text("RAJARAM", x + 3, y + 7);
    pdf.text("CONSUMER CARE PVT. LTD.", x + 3, y + 11);
  }
}

function renderPMChecklistPdf(data: PMPdfData) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  pdf.setProperties({
    title: "Preventive Maintenance Checklist",
    subject: COMPANY.title,
    author: COMPANY.name,
    creator: "RCC-OMP",
  });

  const x = PAGE.margin;
  const y = PAGE.margin;
  const w = PAGE.right - PAGE.margin;

  drawRect(pdf, x, y, w, PAGE.bottom - y, 0.4);

  const stampH = 10;

  drawRect(pdf, x, y, w, stampH, 0.3);
  drawLine(pdf, x + w / 2, y, x + w / 2, y + stampH, 0.25);

  pdf.setTextColor(180, 180, 180);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);

  pdf.text(
    "Space for Controlled/ Uncontrolled Stamp",
    x + 36,
    y + 6.5,
    { align: "center" },
  );

  pdf.text("Space for Master Stamp", x + w - 36, y + 6.5, {
    align: "center",
  });

  const headerY = y + stampH;
  const headerH = 42;

  const logoW = 37;
  const middleW = 102;
  const rightW = w - logoW - middleW;

  drawRect(pdf, x, headerY, w, headerH, 0.3);

  drawLine(
    pdf,
    x + logoW,
    headerY,
    x + logoW,
    headerY + headerH,
    0.25,
  );

  drawLine(
    pdf,
    x + logoW + middleW,
    headerY,
    x + logoW + middleW,
    headerY + headerH,
    0.25,
  );

  drawLine(
    pdf,
    x + logoW + middleW,
    headerY + 19,
    x + w,
    headerY + 19,
    0.25,
  );

  drawLine(pdf, x, headerY + 19, x + logoW, headerY + 19, 0.25);
  drawLine(
    pdf,
    x + logoW,
    headerY + 19,
    x + logoW + middleW,
    headerY + 19,
    0.25,
  );

  addRccLogo(pdf, x + 3, headerY + 4, 30, 12);

  pdf.setTextColor(...COLORS.text);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);

  pdf.text(COMPANY.name, x + logoW + middleW / 2, headerY + 7, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.4);

  pdf.text(COMPANY.line1, x + logoW + middleW / 2, headerY + 12, {
    align: "center",
  });

  pdf.text(COMPANY.line2, x + logoW + middleW / 2, headerY + 16, {
    align: "center",
  });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);

  pdf.text(`Page 1 of 1`, x + logoW + middleW + rightW / 2, headerY + 7, {
    align: "center",
  });

  pdf.text(
    `SOP No.: ${COMPANY.sopNo}`,
    x + logoW + middleW + rightW / 2,
    headerY + 14,
    { align: "center" },
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);

  pdf.text("TITLE:", x + 4, headerY + 27);

  pdf.setFontSize(9);

  pdf.text(
    COMPANY.title,
    x + logoW + middleW / 2,
    headerY + 27,
    { align: "center" },
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);

  pdf.text("Effective Date:", x + logoW + middleW + 3, headerY + 26);

  drawLine(
    pdf,
    x + logoW + middleW + 3,
    headerY + 29,
    x + w - 3,
    headerY + 29,
    0.2,
  );

  pdf.text("Review Date:", x + logoW + middleW + 3, headerY + 35);

  drawLine(
    pdf,
    x + logoW + middleW + 3,
    headerY + 38,
    x + w - 3,
    headerY + 38,
    0.2,
  );

  if (data.effectiveDate) {
    pdf.setFont("helvetica", "normal");
    pdf.text(data.effectiveDate, x + logoW + middleW + 3, headerY + 28);
  }

  if (data.reviewDate) {
    pdf.text(data.reviewDate, x + logoW + middleW + 3, headerY + 37);
  }

  const annexY = headerY + headerH;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);

  pdf.text(`Annexure No.: ${COMPANY.annexure}`, x + 2, annexY + 5);

  drawLine(pdf, x, annexY + 7, x + w, annexY + 7, 0.25);

  const infoY = annexY + 7;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.2);
  pdf.text("PM INFORMATION", x + 2, infoY + 5);

  drawLabelLine(
    pdf,
    "Due date of preventive maintenance:",
    data.dueDate || "",
    x + 2,
    infoY + 12,
    w - 4,
  );

  drawLabelLine(
    pdf,
    "Preventive maintenance performed on (Date):",
    data.completedDate || "",
    x + 2,
    infoY + 19,
    w - 4,
  );

  drawLabelLine(
    pdf,
    "Department Name:",
    data.department || "",
    x + 2,
    infoY + 26,
    w - 4,
  );

  drawLabelLine(
    pdf,
    "System Code:",
    data.systemCode || "",
    x + 2,
    infoY + 33,
    w - 4,
  );

  const execTitleY = infoY + 41;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.2);
  pdf.text("EXECUTION ACTIVITIES", x + 2, execTitleY);

  const tableY = execTitleY + 3;

  const col1 = 16;
  const col2 = 94;
  const col3 = w - col1 - col2;

  const headerRowH = 6;
  const baseRowH = 8.5;

  pdf.setFillColor(...COLORS.lightGray);
  pdf.rect(x, tableY, w, headerRowH, "F");

  drawRect(pdf, x, tableY, w, headerRowH, 0.25);

  drawLine(pdf, x + col1, tableY, x + col1, tableY + headerRowH, 0.25);
  drawLine(
    pdf,
    x + col1 + col2,
    tableY,
    x + col1 + col2,
    tableY + headerRowH,
    0.25,
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(...COLORS.text);

  pdf.text("Sr. No.", x + 2, tableY + 4);
  pdf.text("Execution activity", x + col1 + 2, tableY + 4);
  pdf.text("Observation", x + col1 + col2 + 2, tableY + 4);

  const checklistMap = new Map(
    (data.checklist || []).map((item) => [item.number, item]),
  );

  let currentY = tableY + headerRowH;

  SOP_CHECKLIST.forEach((official) => {
    const saved = checklistMap.get(official.number);
    const activity = official.label;
    const observation = saved?.observation || "";

    const activityLines = pdf.splitTextToSize(
      activity,
      col2 - 4,
    );

    const observationLines = pdf.splitTextToSize(
      observation,
      col3 - 4,
    );

    const lineCount = Math.max(
      activityLines.length,
      observationLines.length,
      1,
    );

    const rowH = Math.max(
      baseRowH,
      lineCount * 4 + 3,
    );

    drawRect(pdf, x, currentY, w, rowH, 0.25);

    drawLine(
      pdf,
      x + col1,
      currentY,
      x + col1,
      currentY + rowH,
      0.25,
    );

    drawLine(
      pdf,
      x + col1 + col2,
      currentY,
      x + col1 + col2,
      currentY + rowH,
      0.25,
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.8);
    pdf.setTextColor(...COLORS.text);

    pdf.text(official.number, x + 2, currentY + 5);

    activityLines.forEach((line: string, index: number) => {
      pdf.text(line, x + col1 + 2, currentY + 5 + index * 4);
    });

    observationLines.forEach((line: string, index: number) => {
      pdf.text(line, x + col1 + col2 + 2, currentY + 5 + index * 4);
    });

    currentY += rowH;
  });

  currentY += 2;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("SIGN-OFF", x + 2, currentY);

  currentY += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.3);

  pdf.text(
    "Preventive maintenance done by (Sign & Date)",
    x + 2,
    currentY,
  );

  drawLine(
    pdf,
    x + 76,
    currentY + 0.7,
    x + 140,
    currentY + 0.7,
    0.25,
  );

  if (data.performedBy) {
    pdf.text(
      `${data.performedBy}${
        data.performedByDate ? ` / ${data.performedByDate}` : ""
      }`,
      x + 77,
      currentY,
    );
  }

  currentY += 8;

  pdf.text(
    "Preventive maintenance reviewed by (Sign & Date)",
    x + 2,
    currentY,
  );

  drawLine(
    pdf,
    x + 80,
    currentY + 0.7,
    x + 140,
    currentY + 0.7,
    0.25,
  );

  if (data.reviewedBy) {
    pdf.text(
      `${data.reviewedBy}${
        data.reviewedByDate ? ` / ${data.reviewedByDate}` : ""
      }`,
      x + 81,
      currentY,
    );
  }

  const footerTop = PAGE.bottom - 28;

  drawLine(pdf, x, footerTop, x + w, footerTop, 0.3);

  const footerMid = x + w / 2;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.7);

  pdf.text(
    `Department: ${data.department || ""}`,
    x + 2,
    footerTop + 5,
  );

  pdf.text(
    `Issued by: ${data.issuedBy || ""}`,
    footerMid - 27,
    footerTop + 5,
  );

  pdf.text(
    `Copy No.: ${data.copyNo || ""}`,
    x + 2,
    footerTop + 11,
  );

  pdf.text(
    `Authorized by Head QA: ${data.authorizedByQA || ""}`,
    footerMid - 27,
    footerTop + 11,
  );

  drawLine(
    pdf,
    x,
    footerTop + 16,
    x + w,
    footerTop + 16,
    0.25,
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);

  pdf.text(
    `Authorized by Head QA (Sign & Date): ${data.authorizedByQA || ""}`,
    x + 2,
    footerTop + 23,
  );

  pdf.text(
    `Annexure No.: ${COMPANY.annexure}`,
    x + w - 2,
    footerTop + 23,
    { align: "right" },
  );

  const safeSystemCode =
    (data.systemCode || "system")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-");

  const safeDate = (data.completedDate || new Date().toISOString().slice(0, 10))
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  pdf.save(`pm-checklist-${safeSystemCode}-${safeDate}.pdf`);
}

export function exportPMChecklistPdf(
  record: PMRecord,
  items: PMChecklistItem[] = record.checklistResponses || [],
  notes = record.completionNotes || "",
) {
  const checklist = SOP_CHECKLIST.map((item) => {
    const response = items.find(
      (saved) => saved.number === item.number || saved.label === item.label,
    );

    return {
      number: item.number,
      activity: item.label,
      observation: response?.observation || "",
      status: response?.status || "Completed",
    } satisfies PMChecklistDisplayItem;
  });

  const data: PMPdfData = {
    dueDate: record.nextDue ? formatDate(record.nextDue) : "",
    completedDate: record.completionDate ? formatDate(record.completionDate) : "",
    department: record.department || "",
    systemCode: record.systemId || record.machineId || record.machine || "",
    performedBy: record.user || record.assignedUser || "",
    performedByDate: record.completionDate ? formatDate(record.completionDate) : "",
    reviewedBy: record.assignedUser || record.user || "",
    reviewedByDate: record.completionDate ? formatDate(record.completionDate) : "",
    effectiveDate: record.lastMaintenance ? formatDate(record.lastMaintenance) : "",
    reviewDate: record.nextDue ? formatDate(record.nextDue) : "",
    issuedBy: record.user || record.assignedUser || "",
    authorizedByQA: record.user || record.assignedUser || "",
    copyNo: record.id || "",
    checklist,
    completionNotes: notes,
  };

  renderPMChecklistPdf(data);
}

export function exportPMChecklistPdfData(data: PMPdfData) {
  renderPMChecklistPdf(data);
}