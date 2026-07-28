// ─────────────────────────────────────────────────────────────────────────────
// QA MODULE — TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type QAStatus = "Upcoming" | "Completed" | "Paused" | "Cancelled";
export type QAPriority = "Low" | "Medium" | "High" | "Critical";

export interface QAActionEntry {
  time: string;
  note: string;
}

export interface QAActivity {
  id: string;
  qmsNumber: string;
  qmsType: string;
  qmsDescription: string;
  department: string;
  targetDate: string;
  dueDate: string;
  reminder: string;
  reminderDate?: string;
  priority: QAPriority;
  assignedUser: string;
  status: QAStatus;
  frequency: string;
  lastDueDate?: string;
  completionDate?: string;
  completionNotes?: string;
  completedBy?: string;
  actionHistory: QAActionEntry[];
  actionNotes?: string;
  createdAt: string;
  updatedAt: string;
  recurringParentId?: string;
}

export interface QAActivityFormState {
  qmsNumber: string;
  qmsType: string;
  qmsDescription: string;
  department: string;
  targetDate: string;
  dueDate: string;
  reminder: string;
  priority: QAPriority;
  assignedUser: string;
  frequency: string;
  action: string;
}

export interface QAFiltersState {
  department: string;
  reminder: string;
  status: string;
  priority: string;
  targetDate: string;
}

export interface QAColumnsState {
  qmsType: boolean;
  department: boolean;
  dueDate: boolean;
  lastDueDate?: boolean;
  reminder: boolean;
  frequency: boolean;
  priority: boolean;
  status: boolean;
  action: boolean;
}

export interface QATrendPoint {
  name: string;
  pending: number;
  completed: number;
}

export interface QADepartmentBreakdownPoint {
  name: string;
  score: number;
}

export type QAViewMode = "table" | "card" | "calendar";
