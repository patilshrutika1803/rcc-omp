import type {
  CompletedStatus,
  QAActivity,
  QADepartmentBreakdownPoint,
  QAFiltersState,
  QATrendPoint,
} from "../types/qa";

// ─────────────────────────────────────────────────────────────────────────────
// QA MODULE — HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function isOverdue(activity: QAActivity): boolean {
  if (activity.completed === "Completed" || !activity.targetDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(activity.targetDate);
  return target < today;
}

export function isUpcoming(activity: QAActivity): boolean {
  if (activity.completed === "Completed" || !activity.targetDate) return false;
  return !isOverdue(activity);
}

export function completedStatusCfg(status: CompletedStatus) {
  switch (status) {
    case "Completed": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Pending":   return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
    default:          return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
  }
}

// ── Search / Filter ──────────────────────────────────────────────────────────

export function matchesSearch(record: QAActivity, search: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    record.qmsNumber.toLowerCase().includes(q) ||
    record.qmsType.toLowerCase().includes(q) ||
    record.department.toLowerCase().includes(q) ||
    record.qmsDescription.toLowerCase().includes(q)
  );
}

export function matchesFilters(record: QAActivity, filters: QAFiltersState): boolean {
  const matchDept = !filters.department || record.department === filters.department;
  const matchReminder = !filters.reminder || record.reminder === filters.reminder;
  const matchCompleted = !filters.completed || record.completed === filters.completed;
  const matchDate = !filters.targetDate || record.targetDate === filters.targetDate;
  return matchDept && matchReminder && matchCompleted && matchDate;
}

export function filterActivities(
  activities: QAActivity[],
  search: string,
  filters: QAFiltersState
): QAActivity[] {
  return activities.filter(r => matchesSearch(r, search) && matchesFilters(r, filters));
}

// ── Dashboard calculations ───────────────────────────────────────────────────

export function getDashboardMetrics(activities: QAActivity[]) {
  const totalCount = activities.length;
  const pendingCount = activities.filter(a => a.completed === "Pending").length;
  const completedCount = activities.filter(a => a.completed === "Completed").length;
  const overdueCount = activities.filter(isOverdue).length;
  const upcomingCount = activities.filter(isUpcoming).length;
  return { totalCount, pendingCount, completedCount, overdueCount, upcomingCount };
}

// Monthly trend derived from real target dates (empty gracefully when no data)
export function getTrendData(activities: QAActivity[]): QATrendPoint[] {
  if (activities.length === 0) return [];
  const buckets: Record<string, QATrendPoint> = {};
  activities.forEach(a => {
    if (!a.targetDate) return;
    const d = new Date(a.targetDate);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (!buckets[key]) buckets[key] = { name: key, pending: 0, completed: 0 };
    if (a.completed === "Completed") buckets[key].completed += 1;
    else buckets[key].pending += 1;
  });
  return Object.values(buckets);
}

// Department completion breakdown derived from real data
export function getDepartmentBreakdown(activities: QAActivity[]): QADepartmentBreakdownPoint[] {
  if (activities.length === 0) return [];
  const map: Record<string, { total: number; completed: number }> = {};
  activities.forEach(a => {
    if (!map[a.department]) map[a.department] = { total: 0, completed: 0 };
    map[a.department].total += 1;
    if (a.completed === "Completed") map[a.department].completed += 1;
  });
  return Object.entries(map).map(([name, v]) => ({
    name,
    score: Math.round((v.completed / v.total) * 100),
  }));
}
