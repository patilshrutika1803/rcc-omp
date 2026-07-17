// ─────────────────────────────────────────────────────────────────────────────
// dashboardService
//
// This is the single connection point between the Dashboard UI and any
// backend. Today every function returns empty data (no mock/demo data).
//
// Later, each function body will be replaced with a Supabase query
// (and/or an AWS API call) WITHOUT changing:
//   - function names
//   - function signatures / return types
//   - any component or hook that consumes this service
//
// See the bottom of this file for notes on the future Supabase/AWS wiring.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  DashboardStats,
  WeeklyOverviewPoint,
  TaskDistributionSlice,
  RecentActivityItem,
  UpcomingDeadline,
  CalendarEvent,
  WorkQueueTask,
  PersonalNotes,
} from "../types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    kpis: [],
    machineHealth: {
      healthy: 0,
      warning: 0,
      critical: 0,
      alertTitle: "",
      alertDesc: "",
    },
    departmentProgress: [],
  };
}

export async function getWeeklyOverview(): Promise<WeeklyOverviewPoint[]> {
  return [];
}

export async function getTaskDistribution(): Promise<TaskDistributionSlice[]> {
  return [];
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  return [];
}

export async function getUpcomingDeadlines(): Promise<UpcomingDeadline[]> {
  return [];
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return [];
}

export async function getWorkQueue(): Promise<WorkQueueTask[]> {
  return [];
}

export async function getNotes(): Promise<PersonalNotes> {
  return { content: "" };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUTURE BACKEND WIRING (not implemented yet, do not import Supabase yet)
//
// Frontend (DashboardPage / cards)
//   -> useDashboard() hook
//     -> dashboardService.ts   <-- only this file changes
//       -> Supabase client (@supabase/supabase-js) queries against
//          Supabase Database tables (tasks, backups, pm_jobs, qa_scans,
//          notes, activity_log, calendar_events, machine_health, ...)
//       -> optionally, Supabase Edge Functions / AWS API Gateway + Lambda
//          for heavier aggregation, then Supabase/AWS returns JSON that is
//          mapped into the same DashboardStats / WeeklyOverviewPoint / etc.
//          shapes already defined in types/dashboard.ts.
//
// Because every component and the useDashboard hook only depend on the
// TYPES and FUNCTION SIGNATURES exported from this file, swapping an empty
// array for `const { data } = await supabase.from('tasks').select(...)`
// requires zero changes to DashboardPage.tsx or any card component.
// ─────────────────────────────────────────────────────────────────────────────
