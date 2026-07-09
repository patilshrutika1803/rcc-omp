export type PMStatus = "Due Today" | "Upcoming" | "Completed" | "Overdue" | "In Progress" | "Scheduled";
export type PMPriority = "Critical" | "High" | "Medium" | "Low";

export interface PMRecord {
  id: string;
  machine: string;
  machineId: string;
  department: string;
  frequency: string;
  lastMaintenance: string;
  nextDue: string;
  priority: PMPriority;
  user: string;
  status: PMStatus;
  description: string;
  location: string;
  model: string;
  history: { date: string; user: string; notes: string; status: string }[];
}

