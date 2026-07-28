import type {
  QAActivity,
  QADepartmentBreakdownPoint,
  QAFiltersState,
  QATrendPoint,
  QAStatus,
} from "../types/qa";

// ─────────────────────────────────────────────────────────────────────────────
// QA MODULE — HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const REMINDER_DAYS_MAP: Record<string, number> = {
  "Same Day": 0,
  "1 Day Before": 1,
  "3 Days Before": 3,
  "7 Days Before": 7,
  "15 Days Before": 15,
  "30 Days Before": 30,
};

function parseDateValue(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function calculateReminderDate(dueDate: string, reminderOption: string | undefined): string | undefined {
  if (!reminderOption || !dueDate) return undefined;
  const days = REMINDER_DAYS_MAP[reminderOption];
  if (days === undefined) return undefined;

  const parsed = parseDateValue(dueDate);
  if (!parsed) return undefined;
  parsed.setDate(parsed.getDate() - days);
  return formatDateOnly(parsed);
}

export function calculateNextDueDate(currentDueDate: string, frequency: string): string {
  const parsed = parseDateValue(currentDueDate);
  if (!parsed) return "";

  switch (frequency) {
    case "Daily":
      parsed.setDate(parsed.getDate() + 1);
      break;
    case "Weekly":
      parsed.setDate(parsed.getDate() + 7);
      break;
    case "Monthly":
      parsed.setMonth(parsed.getMonth() + 1);
      break;
    case "Quarterly":
      parsed.setMonth(parsed.getMonth() + 3);
      break;
    case "Half-Yearly":
    case "Half Yearly":
      parsed.setMonth(parsed.getMonth() + 6);
      break;
    case "Yearly":
      parsed.setFullYear(parsed.getFullYear() + 1);
      break;
    case "One Time":
    default:
      return "";
  }

  return formatDateOnly(parsed);
}

export function isOverdue(activity: QAActivity): boolean {
  if (activity.status === "Completed" || !activity.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(activity.dueDate);
  return target < today;
}

export function isUpcoming(activity: QAActivity): boolean {
  if (activity.status === "Completed" || !activity.dueDate) return false;
  return !isOverdue(activity);
}

export function activeStatusColor(status: QAStatus) {
  switch (status) {
    case "Completed": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Paused": return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    case "Cancelled": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
    case "Upcoming":
    default: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  }
}

export function matchesSearch(record: QAActivity, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    record.qmsNumber.toLowerCase().includes(q) ||
    record.qmsType.toLowerCase().includes(q) ||
    record.department.toLowerCase().includes(q) ||
    record.qmsDescription.toLowerCase().includes(q) ||
    record.assignedUser.toLowerCase().includes(q)
  );
}

export function matchesFilters(record: QAActivity, filters: QAFiltersState): boolean {
  const matchDept = !filters.department || record.department === filters.department;
  const matchReminder = !filters.reminder || record.reminder === filters.reminder;
  const matchStatus = !filters.status || record.status === filters.status;
  const matchPriority = !filters.priority || record.priority === filters.priority;
  const matchFrequency = !filters.targetDate || record.frequency === filters.targetDate;
  return matchDept && matchReminder && matchStatus && matchPriority && matchFrequency;
}

export function filterActivities(activities: QAActivity[], search: string, filters: QAFiltersState): QAActivity[] {
  return activities.filter((record) => matchesSearch(record, search) && matchesFilters(record, filters));
}

export function getDashboardMetrics(activities: QAActivity[]) {
  const totalCount = activities.length;
  const pendingCount = activities.filter((activity) => activity.status === "Upcoming").length;
  const completedCount = activities.filter((activity) => activity.status === "Completed").length;
  const overdueCount = activities.filter(isOverdue).length;
  const upcomingCount = activities.filter((activity) => activity.status === "Paused").length;
  return { totalCount, pendingCount, completedCount, overdueCount, upcomingCount };
}

export function getTrendData(activities: QAActivity[]): QATrendPoint[] {
  if (activities.length === 0) return [];
  const buckets: Record<string, QATrendPoint> = {};
  activities.forEach((activity) => {
    if (!activity.dueDate) return;
    const date = new Date(activity.dueDate);
    const key = date.toLocaleString("default", { month: "short", year: "2-digit" });
    if (!buckets[key]) buckets[key] = { name: key, pending: 0, completed: 0 };
    if (activity.status === "Completed") buckets[key].completed += 1;
    else buckets[key].pending += 1;
  });
  return Object.values(buckets);
}

export function getDepartmentBreakdown(activities: QAActivity[]): QADepartmentBreakdownPoint[] {
  if (activities.length === 0) return [];
  const map: Record<string, { total: number; completed: number }> = {};
  activities.forEach((activity) => {
    if (!map[activity.department]) map[activity.department] = { total: 0, completed: 0 };
    map[activity.department].total += 1;
    if (activity.status === "Completed") map[activity.department].completed += 1;
  });
  return Object.entries(map).map(([name, value]) => ({
    name,
    score: Math.round((value.completed / value.total) * 100),
  }));
}
