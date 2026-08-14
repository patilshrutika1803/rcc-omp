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
  UpcomingDeadline,
  CalendarEvent,
  WorkQueueTask,
  PersonalNotes,
} from "../types/dashboard";

import { loadPMState } from "../../preventive-maintenance/utils/pmStorage";
import { loadPersistedBackupJobs } from "../../backup/utils/backupStorage";
import { loadPersistedQAActivities } from "../../qa/utils/qaStorage";
import { getActiveInspections } from "../../inspection-schedule/services/inspectionScheduleService";
import * as noteService from "../../notes/services/noteService";

function getStatusClass(status: string): string {
  if (status.toLowerCase().includes("overdue") || status.toLowerCase().includes("critical")) {
    return "bg-red-100 text-red-700";
  }
  if (status.toLowerCase().includes("due today") || status.toLowerCase().includes("upcoming")) {
    return "bg-amber-100 text-amber-700";
  }
  if (status.toLowerCase().includes("completed")) {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-slate-100 text-slate-700";
}

function toDateValue(value: string | undefined): Date | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function isCompletedStatus(status?: string): boolean {
  return !!status && status.toLowerCase().includes("completed");
}

function isDateToday(value?: string): boolean {
  const date = toDateValue(value);
  if (!date) return false;

  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function isRelevantTodayTask(status?: string, dateValue?: string): boolean {
  if (isCompletedStatus(status)) return false;
  return isDateToday(dateValue);
}

export async function getUpcomingDeadlines(): Promise<UpcomingDeadline[]> {
  const records: Array<{ date?: string; title: string; type: string }> = [];

  loadPMState().records.forEach((record) => {
    if (record.nextDue) {
      records.push({ date: record.nextDue, title: `${record.machine} PM`, type: "PM" });
    }
  });

  loadPersistedBackupJobs().activeJobs.forEach((job) => {
    if (job.nextDueDate || job.nextBackup) {
      records.push({ date: job.nextDueDate || job.nextBackup.split(" ")[0], title: `${job.name} Backup`, type: "Backup" });
    }
  });

  loadPersistedQAActivities().forEach((item) => {
    if (item.dueDate || item.targetDate) {
      records.push({ date: item.dueDate || item.targetDate, title: `${item.qmsNumber} QA`, type: "QA" });
    }
  });

  getActiveInspections().forEach((item) => {
    if (item.dueDate) {
      records.push({ date: item.dueDate, title: `${item.description} Inspection`, type: "Inspection" });
    }
  });

  return records
    .filter((item) => item.date)
    .sort((a, b) => {
      const aDate = toDateValue(a.date ?? "")?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bDate = toDateValue(b.date ?? "")?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    })
    .slice(0, 5)
    .map((item) => ({
      time: toDateValue(item.date ?? "") ? new Date(toDateValue(item.date ?? "") as Date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      task: item.title,
      type: item.type,
    }));
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const currentMonth = new Date();
  const monthKey = toMonthKey(currentMonth);
  const events = new Map<number, CalendarEvent>();

  const addEventFromDate = (value: string | undefined) => {
    const date = toDateValue(value);
    if (!date) return;
    if (toMonthKey(date) !== monthKey) return;
    const day = date.getDate();
    const existing = events.get(day) ?? { day, hasTask: false, isOverdue: false };
    events.set(day, { ...existing, hasTask: true, isOverdue: existing.isOverdue || date < new Date() });
  };

  loadPMState().records.forEach((record) => addEventFromDate(record.nextDue));
  loadPersistedBackupJobs().activeJobs.forEach((job) => addEventFromDate(job.nextDueDate || job.nextBackup.split(" ")[0]));
  loadPersistedQAActivities().forEach((item) => addEventFromDate(item.dueDate || item.targetDate));
  getActiveInspections().forEach((item) => addEventFromDate(item.dueDate));

  return Array.from(events.values()).sort((a, b) => a.day - b.day);
}

export async function getWorkQueue(): Promise<WorkQueueTask[]> {
  const tasks: WorkQueueTask[] = [];

  loadPMState().records.forEach((record) => {
    const dueDate = record.nextDue;
    if (!isRelevantTodayTask(record.status, dueDate)) return;

    tasks.push({
      id: record.id,
      desc: record.machine || record.description || "PM Task",
      type: "PM",
      prio: record.priority || "Medium",
      status: record.status || "Upcoming",
      sColor: getStatusClass(record.status || "Upcoming"),
    });
  });

  loadPersistedBackupJobs().activeJobs.forEach((job) => {
    const dueDate = job.nextDueDate || job.nextBackup?.split(" ")[0];
    if (!isRelevantTodayTask(job.status, dueDate)) return;

    tasks.push({
      id: job.id,
      desc: job.name,
      type: "Backup",
      prio: job.priority || "Medium",
      status: job.status || "Upcoming",
      sColor: getStatusClass(job.status || "Upcoming"),
    });
  });

  loadPersistedQAActivities().forEach((item) => {
    const dueDate = item.dueDate || item.targetDate;
    if (!isRelevantTodayTask(item.status, dueDate)) return;

    tasks.push({
      id: item.id,
      desc: item.qmsNumber || item.qmsType,
      type: "QA",
      prio: item.priority || "Medium",
      status: item.status || "Upcoming",
      sColor: getStatusClass(item.status || "Upcoming"),
    });
  });

  getActiveInspections().forEach((item) => {
    if (!isRelevantTodayTask(item.status, item.dueDate)) return;

    tasks.push({
      id: item.id,
      desc: item.description || "Inspection",
      type: "Inspection",
      prio: item.priority || "Medium",
      status: item.status || "Upcoming",
      sColor: getStatusClass(item.status || "Upcoming"),
    });
  });

  return tasks.slice(0, 10);
}

export async function getNotes(): Promise<PersonalNotes> {
  const notes = await noteService.getNotes();
  return { content: notes.map((note) => note.content).join("\n\n").trim() };
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
