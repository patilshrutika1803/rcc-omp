import { calculateNextDueDate, calculateReminderDate } from "../../shared/utils/recurringWorkflow";
import type { SystemInventory } from "../../system-inventory/types/system";
import type {
  InspectionCategory,
  InspectionFrequency,
  InspectionPriority,
  InspectionReminderOption,
  InspectionScheduleRecord,
  InspectionStatus,
} from "../types/inspectionSchedule";

const SYSTEM_FREQUENCY_BY_CATEGORY: Record<"GxP" | "Non-GxP", InspectionFrequency> = {
  GxP: "Monthly",
  "Non-GxP": "Every 3 Months",
};

const FREQUENCY_CALC_MAP: Record<InspectionFrequency, string> = {
  Weekly: "Weekly",
  Monthly: "Monthly",
  "Every 3 Months": "Quarterly",
  "Every 6 Months": "Half-Yearly",
  Yearly: "Yearly",
};

export function getFrequencyForCategory(category: InspectionCategory): InspectionFrequency {
  return category === "GxP" ? "Monthly" : "Every 3 Months";
}

export function normalizeFrequencyForCalculation(frequency: InspectionFrequency): string {
  return FREQUENCY_CALC_MAP[frequency];
}

export function calculateInspectionNextDueDate(currentDueDate: string, frequency: InspectionFrequency): string {
  return calculateNextDueDate(currentDueDate, normalizeFrequencyForCalculation(frequency));
}

export function calculateInspectionReminderDate(
  dueDate: string,
  reminderOption: InspectionReminderOption | undefined
): string | undefined {
  return calculateReminderDate(dueDate, reminderOption);
}

export function formatDateDisplay(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatTime(value: string): string {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  const h = Number(hours || "0");
  const m = Number(minutes || "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function combineDateTime(date: string, time: string): Date | null {
  if (!date) return null;
  const normalizedTime = time || "23:59";
  const parsed = new Date(`${date}T${normalizedTime}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isCompletionDateValid(completionDate: string, dueDate: string): boolean {
  if (!completionDate || !dueDate) return false;
  return completionDate >= dueDate;
}

export function getInspectionStatus(dueDate: string, dueTime: string, isCompleted = false): InspectionStatus {
  if (isCompleted) return "Completed";
  const deadline = combineDateTime(dueDate, dueTime);
  if (!deadline) return "Upcoming";

  const now = new Date();
  if (deadline.getTime() < now.getTime()) return "Overdue";

  const today = new Date();
  return deadline.toDateString() === today.toDateString() ? "Due Today" : "Upcoming";
}

export function buildSystemInspectionRecord(system: SystemInventory): InspectionScheduleRecord {
  const nowDate = new Date().toISOString().split("T")[0];
  const category: InspectionCategory = system.systemCategory === "GxP" ? "GxP" : "Non-GxP";
  const frequency = getFrequencyForCategory(category);
  const lastInspectionDate = system.inspectionSettings?.lastInspection ?? nowDate;
  const dueDate = system.inspectionSettings?.nextInspection ?? calculateInspectionNextDueDate(lastInspectionDate, frequency) ?? nowDate;
  const dueTime = "17:00";
  const reminderOption = system.inspectionSettings?.reminder ?? "1 Day Before";

  return {
    id: `insp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    targetType: "System",
    systemId: system.systemId,
    systemSnapshot: {
      systemName: system.systemName,
      systemType: system.systemType,
      systemCategory: category,
      department: system.department,
      assignedUser: system.assignedUser,
    },
    department: system.department || "",
    assignedUser: system.assignedUser || "",
    description: `Recurring ${category} system inspection`,
    category,
    frequency,
    lastInspectionDate,
    dueDate,
    dueTime,
    reminderOption,
    reminderDate: calculateInspectionReminderDate(dueDate, reminderOption),
    reminderTime: dueTime,
    priority: system.inspectionSettings?.priority ?? "Medium",
    status: getInspectionStatus(dueDate, dueTime),
    recurrenceId: `recur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    parentId: undefined,
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function syncSystemInspectionWithSystem(
  inspection: InspectionScheduleRecord,
  system: SystemInventory
): InspectionScheduleRecord {
  const category: InspectionCategory = system.systemCategory === "GxP" ? "GxP" : "Non-GxP";
  const frequency = getFrequencyForCategory(category);
  const sameCategory = inspection.category === category;
  const updated: InspectionScheduleRecord = {
    ...inspection,
    systemId: system.systemId,
    systemSnapshot: {
      systemName: system.systemName,
      systemType: system.systemType,
      systemCategory: category,
      department: system.department,
      assignedUser: system.assignedUser,
    },
    department: system.department || inspection.department,
    assignedUser: system.assignedUser || inspection.assignedUser,
    category,
    frequency: sameCategory ? inspection.frequency : frequency,
    updatedAt: new Date().toISOString(),
  };

  if (!sameCategory && inspection.status !== "Completed") {
    const nextDueDate = calculateInspectionNextDueDate(inspection.lastInspectionDate, frequency) || inspection.dueDate;
    updated.dueDate = nextDueDate;
    updated.reminderDate = calculateInspectionReminderDate(nextDueDate, inspection.reminderOption);
    updated.reminderTime = inspection.dueTime;
    updated.status = getInspectionStatus(nextDueDate, inspection.dueTime);
  }

  if (inspection.status !== "Completed") {
    updated.status = getInspectionStatus(updated.dueDate, updated.dueTime);
  }

  return updated;
}

export function buildNextRecurringInspection(source: InspectionScheduleRecord): InspectionScheduleRecord {
  const nextDueDate = calculateInspectionNextDueDate(source.dueDate, source.frequency);
  const now = new Date().toISOString();
  return {
    ...source,
    id: `insp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    parentId: source.id,
    lastInspectionDate: source.dueDate,
    dueDate: nextDueDate || source.dueDate,
    dueTime: source.dueTime,
    reminderDate: calculateInspectionReminderDate(nextDueDate || source.dueDate, source.reminderOption),
    reminderTime: source.dueTime,
    status: getInspectionStatus(nextDueDate || source.dueDate, source.dueTime),
    completionDate: undefined,
    completionTime: undefined,
    completedBy: undefined,
    completionNotes: undefined,
    history: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildCompletionHistoryEntry(
  inspection: InspectionScheduleRecord,
  completedBy: string,
  completionDate: string,
  completionTime: string,
  completionNotes?: string
) {
  return {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inspectionId: inspection.id,
    recurrenceId: inspection.recurrenceId,
    date: completionDate,
    time: completionTime,
    completedBy,
    completionNotes,
    previousDueDate: inspection.dueDate,
    nextDueDate: calculateInspectionNextDueDate(inspection.dueDate, inspection.frequency) || inspection.dueDate,
    frequency: inspection.frequency,
    priority: inspection.priority,
    status: "Completed" as InspectionStatus,
  };
}
