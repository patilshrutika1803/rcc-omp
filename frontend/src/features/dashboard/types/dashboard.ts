// ─────────────────────────────────────────────────────────────────────────────
// Dashboard domain types
// All interfaces used across the dashboard feature live here.
// ─────────────────────────────────────────────────────────────────────────────

import type { LucideIcon } from "lucide-react";

// ── KPI Cards ───────────────────────────────────────────────────────────────
export interface DashboardKPI {
  label: string;
  val: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

// ── Weekly Overview Chart ──────────────────────────────────────────────────
export interface WeeklyOverviewPoint {
  name: string;
  completed: number;
  added: number;
}

// ── Task Distribution Chart ────────────────────────────────────────────────
export interface TaskDistributionSlice {
  name: string;
  value: number;
  color: string;
}

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

// ── Recent Activity ─────────────────────────────────────────────────────────
export interface RecentActivityItem {
  time: string;
  title: string;
  desc: string;
  color: string;
}

// ── Machine Health Summary ─────────────────────────────────────────────────
export interface MachineHealthSummary {
  healthy: number;
  warning: number;
  critical: number;
  alertTitle: string;
  alertDesc: string;
}

// ── Department Progress ────────────────────────────────────────────────────
export interface DepartmentProgress {
  name: string;
  pct: number;
  color: string;
}

// ── Personal Notes ─────────────────────────────────────────────────────────
export interface PersonalNotes {
  content: string;
}

// ── Aggregate stats bundle (KPIs + machine health + department progress) ──
export interface DashboardStats {
  kpis: DashboardKPI[];
  machineHealth: MachineHealthSummary;
  departmentProgress: DepartmentProgress[];
}
