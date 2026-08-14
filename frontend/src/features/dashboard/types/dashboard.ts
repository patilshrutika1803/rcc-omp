// ─────────────────────────────────────────────────────────────────────────────
// Dashboard domain types
// All interfaces used across the dashboard feature live here.
// ─────────────────────────────────────────────────────────────────────────────

// ── Work Queue Table ───────────────────────────────────────────────────────
export interface WorkQueueTask {
  id: string;
  desc: string;
  type: string;
  prio: string;
  status: string;
  sColor: string;
}

// ── Calendar ────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  day: number;
  hasTask: boolean;
  isOverdue: boolean;
}

// ── Upcoming Deadlines ──────────────────────────────────────────────────────
export interface UpcomingDeadline {
  time: string;
  task: string;
  type: string;
}

// ── Personal Notes ─────────────────────────────────────────────────────────
export interface PersonalNotes {
  content: string;
}
