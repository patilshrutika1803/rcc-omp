import React from "react";
import type { PMStatus } from "../types/pm";
import { statusConfig } from "../utils/pmHelpers";

export function StatusBadge({ status }: { status: PMStatus }) {
  const cfg = statusConfig(status) as { bg: string; text: string; border: string; dot: string };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {status}
    </span>
  );
}

export default StatusBadge;
