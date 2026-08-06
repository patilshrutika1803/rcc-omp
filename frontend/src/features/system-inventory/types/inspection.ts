// ─────────────────────────────────────────────────────────────────────────────
// System Inventory — Inspection Types
// Reuses the same recurring inspection lifecycle architecture as Preventive Maintenance.
// ─────────────────────────────────────────────────────────────────────────────

export type InspectionStatus = "Due Today" | "Upcoming" | "Overdue" | "Completed";
export type InspectionPriority = "Critical" | "High" | "Medium" | "Low";
export type InspectionReminderOption = "Same Day" | "1 Day Before" | "3 Days Before" | "7 Days Before";

export interface InspectionHistoryEntry {
  inspectionId?: string; // link back to inspection (immutable)
  recurrenceId?: string; // recurrence key for the cycle
  date: string; // completed date (YYYY-MM-DD)
  time?: string; // completion time (HH:MM)
  completedBy?: string;
  verifiedBy?: string;
  verificationStatus?: string;
  observations?: string;
  correctiveActions?: string;
  remarks?: string;
  completionNotes?: string;
  previousDueDate?: string;
  nextScheduledDue?: string;
  frequency?: string;
  priority?: string;
  status: string;
}

export interface SystemInspectionRecord {
  id: string;
  systemId: string;
  systemName: string;
  systemType: string;
  systemCategory: string;
  department: string;
  location: string;
  assignedUser: string;
  frequency?: string;
  priority: InspectionPriority;
  reminder?: InspectionReminderOption;
  reminderDate?: string;
  originalDueDate: string;
  nextDueDate: string;
  scheduledNextDue?: string;
  status: InspectionStatus;
  description: string;
  recurrenceId?: string;
  parentId?: string;
  completionDate?: string;
  completionTime?: string;
  completedBy?: string;
  verifiedBy?: string;
  completionNotes?: string;
  observations?: string;
  correctiveActions?: string;
  remarks?: string;
  history: InspectionHistoryEntry[];
}
