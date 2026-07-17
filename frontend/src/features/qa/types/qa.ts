// ─────────────────────────────────────────────────────────────────────────────
// QA MODULE — TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CompletedStatus = "Pending" | "Completed";

// A single action / follow-up / remark entry. QA Activities can accumulate
// multiple action entries over time (corrective actions, observations, etc).
export interface QAActionEntry {
  time: string;
  note: string;
}

// Core QA Activity record. This shape maps directly to the future backend
// document / row (MongoDB document or PostgreSQL row) so integration later
// requires minimal changes — only the data-access functions in services/
// need to be swapped from local state to real HTTP calls.
export interface QAActivity {
  id: string;
  qmsNumber: string;
  qmsType: string;
  qmsDescription: string;
  department: string;
  targetDate: string;
  reminder: string;
  completed: CompletedStatus;
  actionHistory: QAActionEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface QAActivityFormState {
  qmsNumber: string;
  qmsType: string;
  qmsDescription: string;
  department: string;
  targetDate: string;
  reminder: string;
  completed: CompletedStatus;
  action: string;
}

export interface QAFiltersState {
  department: string;
  reminder: string;
  completed: string;
  targetDate: string;
}

export interface QAColumnsState {
  qmsType: boolean;
  department: boolean;
  targetDate: boolean;
  reminder: boolean;
  completed: boolean;
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

export type QASubTab = "dashboard" | "activities";
