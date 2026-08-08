import type { HardDiskCycle, HardDiskHistoryRecord } from "../types/hardDisk";

const STORAGE_KEY = "rcc_omp_monthly_hard_disk_cycles_v1";

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
    return {
      activeCycles: Array.isArray(parsed.activeCycles) ? parsed.activeCycles : [],
      completedHistory: Array.isArray(parsed.completedHistory) ? parsed.completedHistory : [],
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
