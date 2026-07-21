import type { PMRecord, PMStatus } from "../types/pm";

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
  completedAt: string;
  completedBy: string;
  checklist: string[];
  completionNotes: string;
  previousDueDate: string;
  previousMaintenanceDate: string;
  frequency: string;
  status: PMStatus;
};

export type PersistedPMStateV1 = {
  version: 1;
  records: PMRecord[];
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
      completionHistory: {},
      reminders: {},
      filters: null,
    };
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

