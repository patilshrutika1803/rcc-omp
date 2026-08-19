import type { InspectionScheduleRecord } from "../types/inspectionSchedule";

const STORAGE_KEY = "rcc_omp_inspection_schedule_v1";

interface PersistedInspectionState {
  activeInspections: InspectionScheduleRecord[];
  completedInspections: InspectionScheduleRecord[];
  deletedInspectionKeys: string[];
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadState(): PersistedInspectionState {
  if (typeof window === "undefined") {
    return { activeInspections: [], completedInspections: [], deletedInspectionKeys: [] };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse<PersistedInspectionState>(raw);
  if (!parsed) {
    return { activeInspections: [], completedInspections: [], deletedInspectionKeys: [] };
  }
  return {
    activeInspections: Array.isArray(parsed.activeInspections) ? parsed.activeInspections : [],
    completedInspections: Array.isArray(parsed.completedInspections) ? parsed.completedInspections : [],
    deletedInspectionKeys: Array.isArray(parsed.deletedInspectionKeys) ? parsed.deletedInspectionKeys : [],
  };
}

function saveState(state: PersistedInspectionState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeInspectionKey(record: InspectionScheduleRecord): string {
  if (record.targetType === "System") {
    return `${record.targetType}:${record.systemId}:${record.dueDate}`;
  }
  return `${record.targetType}:${record.machineId}:${record.dueDate}`;
}

export function getActiveInspections(): InspectionScheduleRecord[] {
  return loadState().activeInspections;
}

export function getCompletedInspections(): InspectionScheduleRecord[] {
  return loadState().completedInspections;
}

export function createInspection(record: InspectionScheduleRecord): InspectionScheduleRecord {
  const state = loadState();
  const exists = state.activeInspections.find((item) =>
    item.id === record.id ||
    item.recurrenceId === record.recurrenceId ||
    normalizeInspectionKey(item) === normalizeInspectionKey(record)
  );
  if (exists) return exists;

  const next: PersistedInspectionState = {
    ...state,
    activeInspections: [record, ...state.activeInspections],
    deletedInspectionKeys: state.deletedInspectionKeys.filter((key) => key !== getDeletionKey(record)),
  };
  saveState(next);
  return record;
}

export function updateInspection(record: InspectionScheduleRecord): InspectionScheduleRecord {
  const state = loadState();
  const next = state.activeInspections.map((item) => (item.id === record.id ? record : item));
  saveState({ ...state, activeInspections: next });
  return record;
}

export function completeInspection(record: InspectionScheduleRecord): void {
  const state = loadState();
  const active = state.activeInspections.filter((item) => item.id !== record.id);
  const alreadyCompleted = state.completedInspections.find(
    (item) => item.id === record.id || item.recurrenceId === record.recurrenceId
  );
  if (alreadyCompleted) {
    saveState({ ...state, activeInspections: active });
    return;
  }
  saveState({ ...state, activeInspections: active, completedInspections: [record, ...state.completedInspections] });
}

function getDeletionKey(record: InspectionScheduleRecord): string {
  if (record.targetType === "System" && record.systemId) return `system:${record.systemId}`;
  return `inspection:${record.id}`;
}

export function isInspectionDeleted(record: InspectionScheduleRecord): boolean {
  return loadState().deletedInspectionKeys.includes(getDeletionKey(record));
}

export function deleteActiveInspection(record: InspectionScheduleRecord): boolean {
  const state = loadState();
  const exists = state.activeInspections.some((item) => item.id === record.id);
  if (!exists) return false;
  const next = state.activeInspections.filter((item) => item.id !== record.id);
  const deletionKey = getDeletionKey(record);
  saveState({
    ...state,
    activeInspections: next,
    deletedInspectionKeys: state.deletedInspectionKeys.includes(deletionKey)
      ? state.deletedInspectionKeys
      : [...state.deletedInspectionKeys, deletionKey],
  });
  return true;
}

export function replaceActiveInspections(nextInspections: InspectionScheduleRecord[]): void {
  const state = loadState();
  saveState({ ...state, activeInspections: nextInspections });
}

export function getInspectionsByRecurrenceId(recurrenceId: string): InspectionScheduleRecord[] {
  return loadState().activeInspections.filter((item) => item.recurrenceId === recurrenceId);
}

export function getInspectionById(id: string): InspectionScheduleRecord | undefined {
  return loadState().activeInspections.find((item) => item.id === id);
}
