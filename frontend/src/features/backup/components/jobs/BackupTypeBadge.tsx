import React from "react";
import type { BkpType } from "../../types/backup";
import { bkpTypeCfg } from "../../utils/backupHelpers";

export function BkpTypeBadge({ type }: { type: BkpType }) {
  const c = bkpTypeCfg(type);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {type}
    </span>
  );
}
