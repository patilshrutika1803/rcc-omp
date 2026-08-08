export const HDD_STATUSES = [
  "Created",
  "Ready for Dispatch",
  "Dispatched from RCC",
  "Received at RSB",
  "Monthly Backup Completed",
  "Return Pending",
  "Returned from RSB",
  "Received at RCC",
  "Cycle Completed",
] as const;

export const HDD_PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;

export const HDD_REMINDER_OPTIONS = [
  "5 Days Before",
  "7 Days Before",
  "10 Days Before",
  "15 Days Before",
  "30 Days Before",
] as const;

export const HDD_DEFAULT_FORM_VALUES = {
  month: "",
  dispatchDate: "",
  expectedReturnDate: "",
  reminderBeforeReturn: "5 Days Before",
  priority: "Medium" as const,
  preparedBy: "",
  responsiblePerson: "",
  remarks: "",
};
