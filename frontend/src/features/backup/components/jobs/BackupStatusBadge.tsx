import React from "react";
import type { BkpStatus } from "../../types/backup";
import { bkpStatusCfg } from "../../utils/backupHelpers";

export function BkpStatusBadge({ status }: { status: BkpStatus }) {
  const c = bkpStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0 ${status === "Running" ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}
