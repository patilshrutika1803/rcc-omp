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

const STORAGE_KEY = "rcc_omp_system_inventory";
const LEGACY_DEMO_SYSTEM_IDS = new Set(["SYS-1001", "SYS-1002"]);
const LEGACY_DEMO_SYSTEM_NAMES = new Set(["Dell Latitude 7420", "HP EliteDesk 800 G6"]);

function sanitizeSystems(systems: unknown): SystemInventory[] {
  if (!Array.isArray(systems)) return [];

  const cleaned = systems.filter((system): system is SystemInventory => {
    if (!system || typeof system !== "object") return false;
    const candidate = system as SystemInventory;
    const systemId = candidate.systemId?.trim() ?? "";
    const systemName = candidate.systemName?.trim() ?? "";
    return !LEGACY_DEMO_SYSTEM_IDS.has(systemId) && !LEGACY_DEMO_SYSTEM_NAMES.has(systemName);
  }).map(system => ({
    ...system,
    systemCategory: system.systemCategory ?? "Non-GxP",
  }));

  return cleaned;
}

function readStoredSystems(): SystemInventory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    const sanitized = sanitizeSystems(parsed);
    if (sanitized.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      writeStoredSystems(sanitized);
    }
    return sanitized;
  } catch {
    return [];
  }
}

function writeStoredSystems(systems: SystemInventory[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(systems));
}

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all systems.
 * TODO: GET /api/system-inventory -> Supabase `systems` table select.
 */
export async function getSystems(): Promise<ServiceResult<SystemInventory[]>> {
  return { data: readStoredSystems(), error: null };
}

/**
 * Fetch a single system by id.
 * TODO: GET /api/system-inventory/:id -> Supabase `.eq('id', id).single()`.
 */
export async function getSystemById(systemId: string): Promise<ServiceResult<SystemInventory | null>> {
  const systems = readStoredSystems();
  const found = systems.find(s => s.systemId === systemId) ?? null;
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
  const systems = readStoredSystems();
  const record: SystemInventory = {
    ...payload,
    systemCategory: payload.systemCategory ?? "Non-GxP",
    createdAt: now,
    updatedAt: now,
  };
  const nextSystems = [record, ...systems];
  writeStoredSystems(nextSystems);
  return { data: record, error: null };
}

/**
 * Update an existing system record.
 * TODO: PUT/PATCH /api/system-inventory/:id -> Supabase update.
 */
export async function updateSystem(systemId: string, payload: SystemInventory): Promise<ServiceResult<SystemInventory>> {
  const now = new Date().toISOString();
  const systems = readStoredSystems();
  const record: SystemInventory = {
    ...payload,
    systemCategory: payload.systemCategory ?? "Non-GxP",
    updatedAt: now,
  };
  const nextSystems = systems.map(system => (system.systemId === systemId ? record : system));
  writeStoredSystems(nextSystems);
  return { data: record, error: null };
}

/**
 * Delete a system record.
 * TODO: DELETE /api/system-inventory/:id -> Supabase delete.
 */
export async function deleteSystem(systemId: string): Promise<ServiceResult<boolean>> {
  const systems = readStoredSystems();
  const nextSystems = systems.filter(system => system.systemId !== systemId);
  writeStoredSystems(nextSystems);
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
