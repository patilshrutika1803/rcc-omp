// ─────────────────────────────────────────────────────────────────────────────
// Preventive Maintenance — Type Definitions
// No fields removed or renamed. Backward compatible with existing UI/imports.
// ─────────────────────────────────────────────────────────────────────────────

export type PMStatus = "Due Today" | "Upcoming" | "Completed" | "Overdue" | "In Progress" | "Scheduled";
export type PMPriority = "Critical" | "High" | "Medium" | "Low";
export type PMChecklistStatus = "Completed" | "Not Required";

export interface PMChecklistItem {
  number: string;
  label: string;
  status: PMChecklistStatus;
  observation: string;
}

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

  // PM scheduling fields
  reminder?: string;
  reminderDate?: string;
  checklist?: string;
  checklistResponses?: PMChecklistItem[];
  completionNotes?: string;
  completionDate?: string;
  scheduledNextDue?: string;
  generatedPdfReference?: string;

  // Recurrence tracking — stable identifier for the recurrence chain.
  // All PMs generated from the same original task share the same recurrenceId.
  recurrenceId?: string;
  // Parent PM id that generated this recurring PM (null for original/root PMs).
  parentId?: string;

  history: {
    date: string;
    user: string;
    notes: string;
    status: string;
    completionTime?: string;
    previousMaintenanceDate?: string;
    previousDueDate?: string;
    frequency?: string;
    priority?: string;
  }[];
}
