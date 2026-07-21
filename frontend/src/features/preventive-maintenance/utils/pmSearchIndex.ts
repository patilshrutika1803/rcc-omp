import type { PMRecord, PMStatus } from "../types/pm";

export type GlobalSearchExtraItem = {
  type: string;
  label: string;
  sub: string;
  status: string;
  pmId?: string;
};

function statusForBadge(status: PMStatus | string | undefined) {
  if (!status) return "";
  return status;
}


export function buildPMGlobalSearchItems(records: PMRecord[]): GlobalSearchExtraItem[] {
  return records
    .map(r => {
      const subParts = [
        r.machineId,
        r.department,
        r.assignedUser,
        r.location,
        r.priority,
        r.frequency,
        r.status,
      ].filter(Boolean);

      return {
        type: "PM",
        label: r.machine,
        sub: subParts.join(" · "),
        status: statusForBadge(r.status),
        pmId: r.id,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

