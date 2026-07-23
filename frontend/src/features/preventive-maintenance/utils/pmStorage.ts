import type { PMChecklistItem, PMRecord, PMStatus } from "../types/pm";

export type PMFiltersPersisted = {
  searchQuery: string;
  quickFilter: string;
  filters: {
    department: string;
    frequency: string;
    priority: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  };
};

export type PMReminderRule = {
  id: string;
  daysBefore: number; // e.g. 0 = Same Day
  label: string;
};

export type PMCompletionEvent = {
  id: string;
  pmId?: string;
  completedAt: string;
  completedBy: string;
  checklist: string[];
  completionNotes: string;
  previousDueDate: string;
  previousMaintenanceDate: string;
  frequency: string;
  status: PMStatus;
  checklistResponses?: PMChecklistItem[];
};

export type PersistedPMStateV1 = {
  version: 1;
  records: PMRecord[];
  completedPMs: PMRecord[]; // Completed PMs stored separately for history
  completionHistory: Record<string, PMCompletionEvent[]>; // key: record machineId (stable id)
  reminders: Record<string, { nextDue: string; label: string; daysBefore: number }[]>; // key: record.id
  filters: PMFiltersPersisted | null;
};

const STORAGE_KEY = "rcc_omp_pm_state_v1";

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadPMState(): PersistedPMStateV1 {
  const parsed = safeJsonParse<PersistedPMStateV1>(
    typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
  );

  if (!parsed || parsed.version !== 1) {
    return {
      version: 1,
      records: [],
      completedPMs: [],
      completionHistory: {},
      reminders: {},
      filters: null,
    };
  }

  // Ensure completedPMs exists even if loaded from older persisted state
  if (!parsed.completedPMs) {
    parsed.completedPMs = [];
  }

  return parsed;
}

export function savePMState(state: PersistedPMStateV1) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function upsertPMRecords(records: PMRecord[]) {
  const state = loadPMState();
  const next: PersistedPMStateV1 = { ...state, records };
  savePMState(next);
  return next;
}

export function setPMFiltersPersisted(p: PMFiltersPersisted | null) {
  const state = loadPMState();
  const next: PersistedPMStateV1 = { ...state, filters: p };
  savePMState(next);
  return next;
}

/** Get all PM records from persisted state */
export function getAllPMRecords(): PMRecord[] {
  return loadPMState().records;
}

/** Save PM records and return updated state */
export function saveAllPMRecords(records: PMRecord[]): PersistedPMStateV1 {
  return upsertPMRecords(records);
}

/** Add a PM record to the completed PMs history */
export function addCompletedPM(record: PMRecord): void {
  const state = loadPMState();
  state.completedPMs = [record, ...state.completedPMs];
  savePMState(state);
}

/** Get all completed PM records */
export function getCompletedPMs(): PMRecord[] {
  return loadPMState().completedPMs;
}

/** Remove a completed PM record from history (if needed) */
export function removeCompletedPM(id: string): void {
  const state = loadPMState();
  state.completedPMs = state.completedPMs.filter(pm => pm.id !== id);
  savePMState(state);
}

export function removePMArtifacts(record: PMRecord): void {
  const state = loadPMState();
  const nextHistory = { ...state.completionHistory };
  const history = nextHistory[record.machineId];
  if (history) {
    nextHistory[record.machineId] = history.filter(event => event.pmId !== record.id);
    if (nextHistory[record.machineId].length === 0) delete nextHistory[record.machineId];
  }
  const next: PersistedPMStateV1 = {
    ...state,
    records: state.records.filter(pm => pm.id !== record.id),
    completedPMs: state.completedPMs.filter(pm => pm.id !== record.id),
    completionHistory: nextHistory,
    reminders: Object.fromEntries(Object.entries(state.reminders).filter(([id]) => id !== record.id)),
  };
  savePMState(next);
}

