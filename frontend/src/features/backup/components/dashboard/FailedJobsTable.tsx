import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { BKP_FAILED_JOBS_SAMPLE } from "../../constants/backupConstants";

export function FailedJobsTable() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-500" /> Failed Jobs — Last 7 Days
        </h3>
        <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">4 failures</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-5 py-3">Job</th>
              <th className="px-4 py-3">Server</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Error</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {BKP_FAILED_JOBS_SAMPLE.map((row, i) => (
              <tr key={i} className="hover:bg-red-50/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <XCircle size={14} className="text-red-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-900">{row.job}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500">{row.server}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{row.dt}</td>
                <td className="px-4 py-3 text-xs text-red-600 font-medium">{row.err}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{row.dur}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{row.eng}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
