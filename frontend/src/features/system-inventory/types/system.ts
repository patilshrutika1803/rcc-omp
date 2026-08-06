// ─────────────────────────────────────────────────────────────────────────────
// System Inventory — Types
// Backend-ready — shaped for MongoDB / Express / REST (future Supabase + AWS).
// ─────────────────────────────────────────────────────────────────────────────

import { SYSTEM_TYPES, SYSTEM_CATEGORIES, STATUS_OPTIONS, PM_FREQUENCIES, PM_PRIORITIES } from "../constants/systemConstants";

export type SystemType = (typeof SYSTEM_TYPES)[number];
export type SystemCategory = (typeof SYSTEM_CATEGORIES)[number];
export type SystemStatus = (typeof STATUS_OPTIONS)[number];
export type PMFrequency = (typeof PM_FREQUENCIES)[number];
export type PMPriority = (typeof PM_PRIORITIES)[number];

export interface SystemPMSettings {
  frequency: PMFrequency;
  lastMaintenance: string;
  nextDue: string;
  priority: PMPriority;
  description: string;
  assignedUser: string;
  reminder: string;
}

export interface SystemInspectionSettings {
  frequency: "Monthly" | "Quarterly";
  lastInspection?: string;
  nextInspection?: string;
  priority: PMPriority;
  reminder?: "Same Day" | "1 Day Before" | "3 Days Before" | "7 Days Before";
  description?: string;
  assignedUser?: string;
}

export interface SystemInventory {
  _id?: string; // MongoDB document id (populated by backend on save)
  systemId: string;
  systemName: string;
  systemType: SystemType | "";
  department: string;
  location: string;
  assignedUser: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: SystemStatus;
  systemCategory: SystemCategory;
  pmSettings?: SystemPMSettings;
  inspectionSettings?: SystemInspectionSettings;
  createdAt: string;
  updatedAt: string;
}
