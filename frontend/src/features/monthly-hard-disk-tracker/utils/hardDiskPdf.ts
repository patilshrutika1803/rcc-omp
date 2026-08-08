import { jsPDF } from "jspdf";
import type { HardDiskCycle } from "../types/hardDisk";

function safeText(value: string | undefined): string {
  return value && value.trim() ? value : "—";
}

export function exportHardDiskCyclePdf(cycle: HardDiskCycle): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("RCC OMP", margin, y);
  y += 24;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Monthly Hard Disk Tracker Report", margin, y);
  y += 24;

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  const lines = [
    `Month: ${safeText(cycle.month)}`,
    `Cycle ID: ${safeText(cycle.cycleId)}`,
    `Status: ${safeText(cycle.status)}`,
    `Dispatch Date: ${safeText(cycle.dispatchDate)}`,
    `Expected Return Date: ${safeText(cycle.expectedReturnDate)}`,
    `Actual Return Date: ${safeText(cycle.actualReturnDate)}`,
    `Current Holder: ${safeText(cycle.currentHolder)}`,
    `Prepared By: ${safeText(cycle.preparedBy)}`,
    `Responsible Person: ${safeText(cycle.responsiblePerson)}`,
    `Priority: ${safeText(cycle.priority)}`,
    `Remarks: ${safeText(cycle.remarks)}`,
  ];

  doc.setFontSize(10);
  lines.forEach((line) => {
    if (y > 760) {
      doc.addPage();
      y = 50;
    }
    doc.text(line, margin, y);
    y += 16;
  });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Timeline", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");

  cycle.history.forEach((entry) => {
    if (y > 760) {
      doc.addPage();
      y = 50;
    }
    doc.text(`${entry.date} ${entry.time} • ${entry.label} • ${entry.user}`, margin, y);
    y += 14;
    doc.text(safeText(entry.remarks), margin + 12, y);
    y += 16;
  });

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Completion Details", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  if (cycle.completionDetails) {
    const completion = cycle.completionDetails;
    doc.text(`Return Date: ${safeText(completion.returnDate)}`, margin, y); y += 14;
    doc.text(`Received By: ${safeText(completion.receivedBy)}`, margin, y); y += 14;
    doc.text(`Verified By: ${safeText(completion.verifiedBy)}`, margin, y); y += 14;
    doc.text(`Hard Disk Condition: ${safeText(completion.hardDiskCondition)}`, margin, y); y += 14;
    doc.text(`Backup Verification: ${safeText(completion.backupVerification)}`, margin, y); y += 14;
    doc.text(`Completion Notes: ${safeText(completion.completionNotes)}`, margin, y); y += 14;
  } else {
    doc.text("No completion form submitted yet.", margin, y);
  }

  doc.text("Signature: __________________________", margin, 780);
  doc.save(`${cycle.cycleId || "monthly-hard-disk"}.pdf`);
}
