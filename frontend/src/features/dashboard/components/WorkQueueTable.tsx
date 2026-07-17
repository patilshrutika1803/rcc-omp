// ─────────────────────────────────────────────────────────────────────────────
// WorkQueueTable
// "Today's Work Queue" table. Data comes via props.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import type { WorkQueueTask } from "../types/dashboard";
import { WORK_QUEUE_TABLE_HEADERS } from "../constants/dashboardConfig";

interface WorkQueueTableProps {
  tasks: WorkQueueTask[];
}

export default function WorkQueueTable({ tasks }: WorkQueueTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Today's Work Queue</h3>
        <div className="flex gap-2">
          <button className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded hover:bg-slate-100">Filter</button>
          <button className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded hover:bg-slate-100">View All</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 border-b border-slate-100">
            <tr>
              {WORK_QUEUE_TABLE_HEADERS.map((header) => (
                <th key={header} className="px-5 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {tasks.map((task, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-slate-500">{task.id}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{task.desc}</td>
                <td className="px-5 py-3 text-xs">{task.type}</td>
                <td className="px-5 py-3 text-xs">
                  <span className={task.prio.includes("P1") ? "text-red-600 font-semibold" : task.prio.includes("P2") ? "text-amber-600 font-semibold" : ""}>
                    {task.prio}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${task.sColor}`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
