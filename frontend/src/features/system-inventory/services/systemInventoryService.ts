// ─────────────────────────────────────────────────────────────────────────────
// System Inventory — Service Layer
//
// This is the ONLY module allowed to talk to the backend. Every other file
// (hooks, components, pages) must go through these functions instead of
// calling fetch()/Supabase directly. That indirection is what lets us swap
// the implementation below for real Supabase + AWS calls later without
// touching any UI code.
//
// TODO (future Supabase integration):
//   - Replace the placeholder bodies with `supabase.from('systems')...` calls.
//   - getSystems() -> supabase.from('systems').select('*')
//   - getSystemById(id) -> supabase.from('systems').select('*').eq('id', id).single()
//   - createSystem(payload) -> supabase.from('systems').insert(payload).select().single()
//       -> a Postgres trigger (or a follow-up call to the Preventive
//          Maintenance service) inserts a PM record automatically when
//          systemType is 'Laptop' or 'Desktop PC'. Printers are skipped.
//   - updateSystem(id, payload) -> supabase.from('systems').update(payload).eq('id', id)
//   - deleteSystem(id) -> supabase.from('systems').delete().eq('id', id)
//   - getDepartments() -> supabase.from('departments').select('*') (or keep static)
//   - File attachments (e.g. photos, invoices) would go through AWS S3,
//     with the resulting S3 URL stored on the system record.
// ─────────────────────────────────────────────────────────────────────────────

import type { SystemInventory } from "../types/system";
import { DEPARTMENTS, PM_ELIGIBLE_TYPES } from "../constants/systemConstants";
import { validateSystemForm } from "../utils/systemHelpers";

// Backend-ready: starts empty. No hardcoded/demo/mock records.
// TODO: GET /api/system-inventory (or Supabase) -> replace/seed this list.
const SYSTEMS: SystemInventory[] = [];

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all systems.
 * TODO: GET /api/system-inventory -> Supabase `systems` table select.
 */
export async function getSystems(): Promise<ServiceResult<SystemInventory[]>> {
  // Placeholder — returns local in-memory state shape until backend is wired.
  return { data: SYSTEMS, error: null };
}

/**
 * Fetch a single system by id.
 * TODO: GET /api/system-inventory/:id -> Supabase `.eq('id', id).single()`.
 */
export async function getSystemById(systemId: string): Promise<ServiceResult<SystemInventory | null>> {
  const found = SYSTEMS.find(s => s.systemId === systemId) ?? null;
  return { data: found, error: null };
}

/**
 * Create a new system record.
 * TODO: POST /api/system-inventory -> Supabase insert.
 * When systemType is Laptop/Desktop PC, the backend should also create a
 * corresponding Preventive Maintenance record (see isPmEligible below).
 * Printers must never be forwarded to Preventive Maintenance.
 */
export async function createSystem(payload: SystemInventory): Promise<ServiceResult<SystemInventory>> {
  const now = new Date().toISOString();
  const record: SystemInventory = { ...payload, createdAt: now, updatedAt: now };
  return { data: record, error: null };
}

/**
 * Update an existing system record.
 * TODO: PUT/PATCH /api/system-inventory/:id -> Supabase update.
 */
export async function updateSystem(systemId: string, payload: SystemInventory): Promise<ServiceResult<SystemInventory>> {
  const now = new Date().toISOString();
  const record: SystemInventory = { ...payload, updatedAt: now };
  return { data: record, error: null };
}

/**
 * Delete a system record.
 * TODO: DELETE /api/system-inventory/:id -> Supabase delete.
 */
export async function deleteSystem(systemId: string): Promise<ServiceResult<boolean>> {
  return { data: true, error: null };
}

/**
 * Fetch the list of departments available for assignment.
 * TODO: could later come from a Supabase `departments` table instead of
 * a static constant.
 */
export async function getDepartments(): Promise<ServiceResult<string[]>> {
  return { data: DEPARTMENTS, error: null };
}

/**
 * Validate a system form payload before create/update.
 * Currently delegates to the shared client-side validator; kept here too
 * so server-side validation can be layered in later without changing
 * call sites in hooks/components.
 */
export function validateSystem(form: SystemInventory): Record<string, string> {
  return validateSystemForm(form);
}

/**
 * Whether a system type participates in Preventive Maintenance.
 * Laptops and Desktop PCs are eligible; Printers are never eligible.
 * Exposed here because this is the boundary that will decide, at save
 * time, whether to also create/update a PM record on the backend.
 */
export function isPmEligible(systemType: string): boolean {
  return PM_ELIGIBLE_TYPES.includes(systemType);
}
