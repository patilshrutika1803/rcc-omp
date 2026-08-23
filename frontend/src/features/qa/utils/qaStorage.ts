import type { QAActivity } from "../types/qa";

const STORAGE_KEY = "rcc_omp_qa_activities";

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadPersistedQAActivities(): QAActivity[] {
  if (typeof window === "undefined") return [];
  const parsed = safeJsonParse<QAActivity[] | null>(window.localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];

  return parsed.map((activity) => {
    const storedStatus = (activity as unknown as { status?: string }).status;
    const status = storedStatus === "Completed" ? "Completed" : storedStatus === "Cancelled" ? "Cancelled" : "Upcoming";

    return {
      ...activity,
      dueDate: activity.dueDate || (activity as QAActivity & { targetDate?: string }).targetDate || "",
      status,
      priority: activity.priority || "Medium",
      assignedUser: activity.assignedUser || "Unassigned",
      reminderDate: activity.reminderDate,
    };
  });
}

export function persistQAActivities(activities: QAActivity[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}
