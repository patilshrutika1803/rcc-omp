import React from "react";
import type { SystemStatus } from "../types/system";
import { statusConfig } from "../utils/systemHelpers";

export function SystemStatusBadge({ status }: { status: SystemStatus | "" }) {
  const cfg = statusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      {status || "—"}
    </span>
  );
}
