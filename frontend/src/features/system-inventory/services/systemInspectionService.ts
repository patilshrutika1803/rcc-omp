// ─────────────────────────────────────────────────────────────────────────────
// System Inventory — Inspection Service
// Persistence layer for active and completed recurring inspection records.
// Mirrors the Preventive Maintenance persistence architecture while keeping
// records separate from the System Inventory master data.
// ─────────────────────────────────────────────────────────────────────────────

import type { SystemInspectionRecord } from "../types/inspection";

const STORAGE_KEY = "rcc_omp_system_inspections";

export interface SystemInspectionPersistedState {
  activeInspections: SystemInspectionRecord[];
  completedInspections: SystemInspectionRecord[];
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadStoredInspectionState(): SystemInspectionPersistedState {
  if (typeof window === "undefined") {
    return { activeInspections: [], completedInspections: [] };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse<SystemInspectionPersistedState>(raw);
  if (!parsed) {
    return { activeInspections: [], completedInspections: [] };
  }
  return {
    activeInspections: Array.isArray(parsed.activeInspections) ? parsed.activeInspections : [],
    completedInspections: Array.isArray(parsed.completedInspections) ? parsed.completedInspections : [],
  };
}

function saveInspectionState(state: SystemInspectionPersistedState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getActiveInspections(): SystemInspectionRecord[] {
  return loadStoredInspectionState().activeInspections;
}

export function getCompletedInspections(): SystemInspectionRecord[] {
  return loadStoredInspectionState().completedInspections;
}

export function createInspection(record: SystemInspectionRecord): SystemInspectionRecord {
  const state = loadStoredInspectionState();
  // Prevent duplicate active inspections by id, recurrenceId or parentId for the same system
  const exists = state.activeInspections.find((item) =>
    item.id === record.id ||
    (record.recurrenceId && item.recurrenceId === record.recurrenceId && item.systemId === record.systemId) ||
    (record.parentId && item.parentId === record.parentId && item.systemId === record.systemId)
  );
  if (exists) return exists;
  const next: SystemInspectionPersistedState = {
    ...state,
    activeInspections: [record, ...state.activeInspections],
  };
  saveInspectionState(next);
  return record;
}

export function updateInspection(record: SystemInspectionRecord): SystemInspectionRecord {
  const state = loadStoredInspectionState();
  // Only update active inspections. Completed inspection history is immutable and must not be modified.
  const active = state.activeInspections.map((item) => (item.id === record.id ? record : item));
  saveInspectionState({ ...state, activeInspections: active });
  return record;
}

export function completeInspection(record: SystemInspectionRecord): void {
  const state = loadStoredInspectionState();
  // Remove from active
  const active = state.activeInspections.filter((item) => item.id !== record.id);

  // Prevent duplicate completed history entries by inspection id or recurrenceId
  const already = state.completedInspections.find((item) => item.id === record.id || (record.recurrenceId && item.recurrenceId === record.recurrenceId));
  if (already) {
    saveInspectionState({ ...state, activeInspections: active });
    return;
  }

  const completed = [record, ...state.completedInspections];
  saveInspectionState({ activeInspections: active, completedInspections: completed });
}

export function deleteActiveInspectionsForSystem(systemId: string): void {
  const state = loadStoredInspectionState();
  const next: SystemInspectionPersistedState = {
    ...state,
    activeInspections: state.activeInspections.filter((inspection) => inspection.systemId !== systemId),
  };
  saveInspectionState(next);
}

export function getInspectionsBySystemId(systemId: string): SystemInspectionRecord[] {
  const state = loadStoredInspectionState();
  return state.activeInspections.filter((inspection) => inspection.systemId === systemId);
}

export function replaceSystemInspections(systemId: string, nextInspections: SystemInspectionRecord[]): void {
  const state = loadStoredInspectionState();
  const active = state.activeInspections.filter((inspection) => inspection.systemId !== systemId);
  saveInspectionState({ ...state, activeInspections: [...nextInspections, ...active] });
}
