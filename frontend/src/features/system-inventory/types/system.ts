// ─────────────────────────────────────────────────────────────────────────────
// System Inventory — Types
// Backend-ready — shaped for MongoDB / Express / REST (future Supabase + AWS).
// ─────────────────────────────────────────────────────────────────────────────

import { SYSTEM_TYPES, STATUS_OPTIONS, PM_FREQUENCIES, PM_PRIORITIES } from "../constants/systemConstants";

export type SystemType = (typeof SYSTEM_TYPES)[number];
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
  pmSettings?: SystemPMSettings;
  createdAt: string;
  updatedAt: string;
}
