export type HardDiskCycleStatus =
  | "Created"
  | "Ready for Dispatch"
  | "Dispatched from RCC"
  | "Received at RSB"
  | "Monthly Backup Completed"
  | "Return Pending"
  | "Returned from RSB"
  | "Received at RCC"
  | "Cycle Completed";

export type HardDiskReminderStatus = "Pending" | "Triggered" | "Completed" | "Skipped";

export interface HardDiskTimelineEntry {
  id: string;
  status: HardDiskCycleStatus;
  label: string;
  date: string;
  time: string;
  user: string;
  remarks: string;
}

export interface HardDiskReminderEntry {
  id: string;
  cycleId: string;
  type: string;
  dueDate: string;
  status: HardDiskReminderStatus;
}

export interface HardDiskCompletionDetails {
  returnDate: string;
  returnTime: string;
  receivedBy: string;
  verifiedBy: string;
  hardDiskCondition: string;
  backupVerification: string;
  remarks: string;
  completionNotes: string;
  attachment?: string;
}

export interface HardDiskAccountabilityRecord {
  completedBy: string;
  completedAt: string;
  notes: string;
}

export interface HardDiskReturnDetails {
  returnDate: string;
  returnedBy: string;
  receivedBy: string;
  returnNotes?: string;
}

export interface HardDiskHistoryRecord {
  id: string;
  month: string;
  cycleId: string;
  dispatchDate: string;
  returnDate: string;
  completedDate: string;
  completedBy: string;
  verifiedBy: string;
  hardDiskCondition: string;
  remarks: string;
  status: HardDiskCycleStatus;
  cycleSnapshot?: HardDiskCycle;
}

export interface HardDiskCycle {
  id: string;
  cycleId: string;
  month: string;
  dispatchDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  accountabilityStatus?: "Pending" | "Completed";
  accountability?: HardDiskAccountabilityRecord | null;
  returnDetails?: HardDiskReturnDetails | null;
  currentHolder: string;
  status: HardDiskCycleStatus;
  priority: "Low" | "Medium" | "High" | "Critical";
  preparedBy: string;
  responsiblePerson: string;
  remarks: string;
  reminderBeforeReturn: string;
  reminderStatus: HardDiskReminderStatus;
  history: HardDiskTimelineEntry[];
  reminders: HardDiskReminderEntry[];
  completionDetails?: HardDiskCompletionDetails;
  createdAt: string;
  updatedAt: string;
  recurrenceId?: string;
  parentId?: string;
}

export interface HardDiskCycleFormValues {
  month: string;
  dispatchDate: string;
  expectedReturnDate: string;
  reminderBeforeReturn: string;
  priority: HardDiskCycle["priority"];
  preparedBy: string;
  responsiblePerson: string;
  remarks: string;
}

export interface HardDiskFilters {
  month: string;
  status: string;
  priority: string;
  dateFrom: string;
  dateTo: string;
  reminderStatus: string;
}
