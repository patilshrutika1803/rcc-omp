// ─────────────────────────────────────────────────────────────────────────────
// Preventive Maintenance — Type Definitions
// No fields removed or renamed. Backward compatible with existing UI/imports.
// ─────────────────────────────────────────────────────────────────────────────

export type PMStatus = "Due Today" | "Upcoming" | "Completed" | "Overdue" | "In Progress" | "Scheduled";
export type PMPriority = "Critical" | "High" | "Medium" | "Low";

export interface PMRecord {
  id: string;

  // Legacy fields used throughout the current UI. Keep for compatibility.
  machine: string;
  machineId: string;

  // AWS-ready, backend-friendly system fields.
  // If PM is created from System Inventory, systemId is set.
  // If created manually, systemId is null.
  systemId: string | null;

  // Both methods store these snapshot fields on the PM record.
  systemName: string;
  systemType: string;
  department: string;
  location: string;
  assignedUser: string;

  // Legacy fields used throughout the current UI. Keep for compatibility.
  model: string;
  user: string;


  frequency: string;
  lastMaintenance: string;
  nextDue: string;
  priority: PMPriority;
  status: PMStatus;
  description: string;

  history: { date: string; user: string; notes: string; status: string }[];
}
