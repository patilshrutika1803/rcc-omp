// ─────────────────────────────────────────────────────────────────────────────
// Preventive Maintenance — Service Layer
//
// This is the ONLY module that should talk to the backend once it exists.
// Currently everything is placeholder / not-yet-connected — no Supabase,
// no AWS calls are made here yet. Each method below documents the intended
// REST call so wiring up the real backend later is a drop-in replacement.
//
// NOTE: Do not import this into components directly for business logic —
// route all calls through hooks/usePreventiveMaintenance.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { PMRecord } from "../types/pm";
import { PM_ELIGIBLE_TYPES } from "../constants/pmConstants";
// System Inventory remains the master module for eligible systems.
import type { SystemInventory } from "../../system-inventory/types/system";
import { getSystems } from "../../system-inventory/services/systemInventoryService";

export interface PMLookups {
  departments: string[];
  users: string[];
}

const preventiveMaintenanceService = {
  /**
   * Fetch all PM task records.
   * TODO: GET /api/pm-records
   */
  async getPMTasks(): Promise<PMRecord[]> {
    // No backend connected yet — start from a clean, empty state.
    return [];
  },

  /**
   * Fetch a single PM task by id.
   * TODO: GET /api/pm-records/:id
   */
  async getTask(id: string): Promise<PMRecord | null> {
    return null;
  },

  /**
   * Create a new PM task.
   * TODO: POST /api/pm-records — the response contains the backend-generated
   * id, which should replace the temporary client-side id.
   */
  async createPM(record: PMRecord): Promise<PMRecord> {
    return record;
  },

  /**
   * Update an existing PM task.
   * TODO: PUT /api/pm-records/:id
   */
  async updatePM(record: PMRecord): Promise<PMRecord> {
    return record;
  },

  /**
   * Delete a PM task.
   * TODO: DELETE /api/pm-records/:id
   */
  async deletePM(id: string): Promise<void> {
    return;
  },

  /**
   * Mark a PM task as completed.
   * TODO: POST /api/pm-records/:id/complete { notes }
   */
  async completePM(id: string, notes: string): Promise<void> {
    return;
  },

  /**
   * Snooze a PM task to a new due date.
   * TODO: POST /api/pm-records/:id/snooze { nextDue }
   */
  async snoozePM(id: string, nextDue: string): Promise<void> {
    return;
  },

  /**
   * Export PM records (e.g. to PDF).
   * TODO: GET /api/pm-records/export
   */
  async exportPM(): Promise<void> {
    return;
  },

  /**
   * Import PM records (e.g. from Excel).
   * TODO: POST /api/pm-records/import
   */
  async importPM(file: File): Promise<void> {
    return;
  },

  /**
   * Fetch lookup/reference data (departments, assignable users).
   * TODO: GET /api/departments, GET /api/users
   */
  async getLookups(): Promise<PMLookups> {
    return { departments: [], users: [] };
  },

  /**
   * Fetch systems eligible for PM scheduling (Laptop / Desktop PC only).
   * System Inventory remains the master/source-of-truth module; this method
   * simply filters it down to PM-eligible types. Printers are always excluded.
   * TODO: GET /api/system-inventory?type=Laptop,Desktop PC — replace SYSTEMS
   * with the live backend list once the API is wired up.
   */
  async getEligibleSystems(): Promise<SystemInventory[]> {
    const result = await getSystems();
    const systems = result.data ?? [];
    return systems.filter(s => PM_ELIGIBLE_TYPES.includes(s.systemType));
  },
};

export default preventiveMaintenanceService;
