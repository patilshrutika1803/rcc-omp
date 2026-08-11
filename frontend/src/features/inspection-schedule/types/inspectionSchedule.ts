import type { SystemInventory } from "../../system-inventory/types/system";

export type InspectionTargetType = "System" | "Machine";
export type InspectionCategory = "GxP" | "Non-GxP" | "Machine";
export type InspectionFrequency = "Weekly" | "Monthly" | "Every 3 Months" | "Every 6 Months" | "Yearly";
export type InspectionPriority = "Critical" | "High" | "Medium" | "Low";
export type InspectionReminderOption = "Same Day" | "1 Day Before" | "2 Days Before" | "3 Days Before" | "7 Days Before";
export type InspectionStatus = "Upcoming" | "Due Today" | "Overdue" | "Completed";

export interface InspectionHistoryEntry {
  id: string;
  inspectionId: string;
  recurrenceId: string;
  date: string;
  time: string;
  completedBy: string;
  completionNotes?: string;
  previousDueDate: string;
  nextDueDate: string;
  frequency: InspectionFrequency;
  priority: InspectionPriority;
  status: InspectionStatus;
}

export interface InspectionScheduleRecord {
  id: string;
  targetType: InspectionTargetType;
  systemId?: string;
  systemSnapshot?: {
    systemName: string;
    systemType: string;
    systemCategory: string;
    department: string;
    assignedUser: string;
  };
  machineId?: string;
  machineName?: string;
  machineType?: string;
  location?: string;
  department: string;
  assignedUser: string;
  description: string;
  category: InspectionCategory;
  frequency: InspectionFrequency;
  lastInspectionDate: string;
  dueDate: string;
  dueTime: string;
  reminderOption: InspectionReminderOption;
  reminderDate?: string;
  reminderTime?: string;
  priority: InspectionPriority;
  status: InspectionStatus;
  recurrenceId: string;
  parentId?: string;
  completionDate?: string;
  completionTime?: string;
  completedBy?: string;
  completionNotes?: string;
  history: InspectionHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}
