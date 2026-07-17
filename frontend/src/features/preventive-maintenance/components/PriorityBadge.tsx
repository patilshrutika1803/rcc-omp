import React from "react";
import { Flag } from "lucide-react";
import type { PMPriority } from "../types/pm";
import { priorityConfig } from "../utils/pmHelpers";

export function PriorityBadge({ priority }: { priority: PMPriority }) {
  const cfg = priorityConfig(priority);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <Flag size={10} className={cfg.icon} />
      {priority}
    </span>
  );
}

export default PriorityBadge;
