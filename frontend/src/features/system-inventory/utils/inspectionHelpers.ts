import { calculateNextDueDate, calculateReminderDate } from "../../shared/utils/recurringWorkflow";
import { daysUntil } from "../../../shared/utils/dateHelpers";
import type { SystemInventory } from "../types/system";
import type { InspectionPriority, InspectionReminderOption, InspectionStatus, SystemInspectionRecord } from "../types/inspection";

const INSPECTION_FREQUENCY_BY_CATEGORY: Record<string, string> = {
  GxP: "Monthly",
  "Non-GxP": "Quarterly",
};

const DEFAULT_PRIORITY: InspectionPriority = "Medium";
const DEFAULT_REMINDER: InspectionReminderOption = "1 Day Before";

export function getInspectionFrequencyByCategory(category: string): string {
  return INSPECTION_FREQUENCY_BY_CATEGORY[category] ?? "Quarterly";
}

export function getInspectionStatus(nextDueDate: string, currentStatus?: InspectionStatus): InspectionStatus {
  if (currentStatus === "Completed") return "Completed";
  const diff = daysUntil(nextDueDate);
  if (Number.isNaN(diff)) return "Upcoming";
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due Today";
  return "Upcoming";
}

export function buildInitialInspectionForSystem(system: SystemInventory): SystemInspectionRecord {
  const today = new Date().toISOString().split("T")[0];
  // Prefer explicit inspectionSettings saved on the system record. Fall back to category defaults.
  const frequency = system.inspectionSettings?.frequency ?? getInspectionFrequencyByCategory(system.systemCategory);
  const originalDue = system.inspectionSettings?.lastInspection ?? today;
  const nextDueDate = system.inspectionSettings?.nextInspection ?? (calculateNextDueDate(originalDue, frequency) || today);
  const reminderDate = calculateReminderDate(nextDueDate, system.inspectionSettings?.reminder ?? DEFAULT_REMINDER);
  const priority = system.inspectionSettings?.priority ?? DEFAULT_PRIORITY;

  return {
    id: `insp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    systemId: system.systemId,
    systemName: system.systemName,
    systemType: system.systemType,
    systemCategory: system.systemCategory,
    department: system.department,
    location: system.location,
    assignedUser: system.assignedUser,
    priority,
    reminder: system.inspectionSettings?.reminder ?? DEFAULT_REMINDER,
    reminderDate,
    originalDueDate: originalDue,
    nextDueDate,
    frequency,
    scheduledNextDue: nextDueDate,
    status: getInspectionStatus(nextDueDate),
    description: `Recurring ${system.systemCategory} system inspection`,
    recurrenceId: `recur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    parentId: undefined,
    history: [],
  };
}

export function syncInspectionWithSystem(system: SystemInventory, inspection: SystemInspectionRecord): SystemInspectionRecord {
  const updated: SystemInspectionRecord = {
    ...inspection,
    systemName: system.systemName,
    systemType: system.systemType,
    systemCategory: system.systemCategory,
    department: system.department,
    location: system.location,
    assignedUser: system.assignedUser,
  };

  const shouldUpdateDueDate = inspection.systemCategory !== system.systemCategory && inspection.status !== "Completed";
  if (shouldUpdateDueDate) {
    const nextDueDate = calculateNextDueDate(inspection.originalDueDate, getInspectionFrequencyByCategory(system.systemCategory)) || inspection.nextDueDate;
    updated.nextDueDate = nextDueDate;
    updated.scheduledNextDue = nextDueDate;
    updated.reminderDate = updated.reminder ? calculateReminderDate(nextDueDate, updated.reminder) : updated.reminderDate;
  }

  if (inspection.status !== "Completed") {
    updated.status = getInspectionStatus(updated.nextDueDate);
  }

  return updated;
}
