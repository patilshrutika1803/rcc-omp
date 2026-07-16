// ─────────────────────────────────────────────────────────────────────────────
// DepartmentReports
// Extracted from the original DeptReportsTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged.
//
// NOTE: Not wired into the exported DepartmentsPage in the original file.
// Preserved here, unused-but-available, to avoid removing any feature.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { FileText, FileSpreadsheet, Plus, Eye, Download, ExternalLink } from "lucide-react";
import type { DepartmentReport } from "../types/department";
import { REPORT_TYPE_COLORS } from "../constants/departmentConfig";

export interface DepartmentReportsProps {
  reports: DepartmentReport[];
}

export default function DepartmentReports({ reports }: DepartmentReportsProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
Department Documents
          <p className="text-xs text-slate-400 mt-0.5">{reports.length} reports available</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <FileSpreadsheet size={13} /> Export All
          </button>
          <button className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={13} /> Generate Report
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-2">No reports available</h3>
          <p className="text-sm text-slate-500 max-w-xs">Generated reports will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reports.map(r => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="text-xs font-bold text-slate-900 leading-snug">{r.title}</div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        r.status === "Ready" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        REPORT_TYPE_COLORS[r.type] || "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {r.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{r.dept}</span>
                    <span className="text-[10px] text-slate-400">{r.date}</span>
                    <span className="text-[10px] text-slate-400">
                      {r.pages} pages · {r.size}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <Eye size={11} /> Preview
                    </button>
                    <button className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <Download size={11} /> PDF
                    </button>
                    <button className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                      <FileSpreadsheet size={11} /> Excel
                    </button>
                    <button className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                      <ExternalLink size={11} /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
