// ─────────────────────────────────────────────────────────────────────────────
// UpcomingDeadlinesCard
// Data comes via props.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Clock } from "lucide-react";
import type { UpcomingDeadline } from "../types/dashboard";

interface UpcomingDeadlinesCardProps {
  deadlines: UpcomingDeadline[];
}

export default function UpcomingDeadlinesCard({ deadlines }: UpcomingDeadlinesCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Clock size={16} className="text-slate-400" /> Upcoming Deadlines
      </h3>
      <div className="space-y-3">
        {deadlines.map((item, i) => (
          <div key={i} className="flex justify-between items-start pb-3 border-b border-slate-50 last:border-0 last:pb-0">
            <div>
              <div className="text-xs font-bold text-slate-800">{item.task}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.time}</div>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
