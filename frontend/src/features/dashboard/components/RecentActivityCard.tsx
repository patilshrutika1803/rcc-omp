// ─────────────────────────────────────────────────────────────────────────────
// RecentActivityCard
// Data comes via props.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Activity } from "lucide-react";
import type { RecentActivityItem } from "../types/dashboard";

interface RecentActivityCardProps {
  activities: RecentActivityItem[];
}

export default function RecentActivityCard({ activities }: RecentActivityCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
        <Activity size={16} className="text-slate-400" /> Recent Activity
      </h3>
      <div className="relative border-l-2 border-slate-100 ml-2 space-y-5">
        {activities.map((log, i) => (
          <div key={i} className="relative pl-6">
            <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
              <div className={`w-1.5 h-1.5 rounded-full bg-current ${log.color}`} />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{log.time}</div>
            <div className="text-xs font-bold text-slate-800">{log.title}</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{log.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
