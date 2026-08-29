import type { HardDiskCycle, HardDiskHistoryRecord } from "../types/hardDisk";

const STORAGE_KEY = "rcc_omp_monthly_hard_disk_cycles_v1";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthStartKey(monthKey: string): string {
  if (!monthKey) return "";
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!yearText || !monthText || Number.isNaN(year) || Number.isNaN(month)) return "";
  return formatLocalDate(new Date(year, month - 1, 1));
}

function monthEndKey(monthKey: string): string {
  if (!monthKey) return "";
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!yearText || !monthText || Number.isNaN(year) || Number.isNaN(month)) return "";
  return formatLocalDate(new Date(year, month, 0));
}

function isPlaceholderHardDiskEntry(entry: Partial<HardDiskCycle> | Partial<HardDiskHistoryRecord>): boolean {
  const checksum = `${entry.remarks || ""} ${entry.cycleId || ""}`.toLowerCase();
  return checksum.includes("initial monthly hard disk tracker cycle") || checksum.includes("auto-generated next monthly cycle");
}

function normalizeCycleDateValues(cycle: HardDiskCycle): HardDiskCycle {
  const monthKey = cycle.month || "";
  const monthStart = monthStartKey(monthKey) || cycle.dispatchDate || "";
  const monthEnd = monthEndKey(monthKey) || cycle.expectedReturnDate || "";

  return {
    ...cycle,
    dispatchDate: monthStart,
    expectedReturnDate: monthEnd,
  };
}

function normalizeCompletedRecord(record: HardDiskHistoryRecord): HardDiskHistoryRecord {
  const monthKey = record.month || "";
  const monthStart = monthStartKey(monthKey) || record.dispatchDate || "";

  return {
    ...record,
    dispatchDate: monthStart,
  };
}

export interface PersistedHardDiskState {
  activeCycles: HardDiskCycle[];
  completedHistory: HardDiskHistoryRecord[];
}

export function loadPersistedHardDiskCycles(): PersistedHardDiskState {
  if (typeof window === "undefined") return { activeCycles: [], completedHistory: [] };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { activeCycles: [], completedHistory: [] };

    const parsed = JSON.parse(raw) as Partial<PersistedHardDiskState>;
    const activeCycles = Array.isArray(parsed.activeCycles) ? parsed.activeCycles : [];
    const completedHistory = Array.isArray(parsed.completedHistory) ? parsed.completedHistory : [];

    return {
      activeCycles: activeCycles.filter((cycle) => !isPlaceholderHardDiskEntry(cycle)).map((cycle) => normalizeCycleDateValues(cycle as HardDiskCycle)),
      completedHistory: completedHistory.filter((record) => !isPlaceholderHardDiskEntry(record)).map((record) => normalizeCompletedRecord(record as HardDiskHistoryRecord)),
    };
  } catch {
    return { activeCycles: [], completedHistory: [] };
  }
}

export function persistHardDiskCycles(activeCycles: HardDiskCycle[], completedHistory: HardDiskHistoryRecord[]): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeCycles, completedHistory }));
  } catch {
    // Ignore storage issues gracefully.
  }
}

export function buildHardDiskFileName(cycle: HardDiskCycle): string {
  const slug = (cycle.month || "monthly-hard-disk")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "monthly-hard-disk"}-report.pdf`;
}
