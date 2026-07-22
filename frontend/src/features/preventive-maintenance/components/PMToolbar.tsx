import React, { type ReactElement } from "react";
import {
  LayoutDashboard,
  ChevronRight,
  Wrench,
  Plus,
  Download,
  Table2,
  Grid3x3,
  Calendar as CalendarIcon,
  History,
} from "lucide-react";
import { toast } from "sonner";
import LiveTimestamp from "../../../app/components/LiveTimestamp";

export type PMViewMode = "table" | "card" | "calendar";

interface PMToolbarProps {
  viewMode: PMViewMode;
  onViewModeChange: (mode: PMViewMode) => void;
  onAddClick: () => void;
  showHistory?: boolean;
  onToggleHistory?: () => void;
  completedCount?: number;
}

const viewToggleOptions: Array<{ id: PMViewMode; Icon: React.ComponentType<{ size: number }>; tip: string }> = [
  { id: "table", Icon: Table2, tip: "Table" },
  { id: "card", Icon: Grid3x3, tip: "Card" },
  { id: "calendar", Icon: CalendarIcon, tip: "Calendar" },
];

export function PMToolbar(props: PMToolbarProps): ReactElement {
  const { viewMode, onViewModeChange, onAddClick, showHistory, onToggleHistory, completedCount } = props;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
        <LayoutDashboard size={12} />
        <span>Dashboard</span>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-semibold">Preventive Maintenance</span>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
            <Wrench size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Preventive Maintenance</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Schedule and track all machine maintenance activities &middot; All Departments
            </p>
            <div className="mt-2 text-xs font-medium text-slate-600">
              <LiveTimestamp />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {typeof onToggleHistory === "function" && (
            <button
              onClick={onToggleHistory}
              className={`flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-lg transition-colors border ${showHistory ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
            >
              <History size={14} />
              History
              {completedCount !== undefined && completedCount > 0 && (
                <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${showHistory ? "bg-slate-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {completedCount}
                </span>
              )}
            </button>
          )}
          {!showHistory && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={14} /> Add PM
            </button>
          )}
          {!showHistory && (
            <button
              onClick={() => { toast.loading("Exporting..."); setTimeout(() => toast.success("Export Completed"), 1500); }}
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={14} /> Export PDF
            </button>
          )}
          {!showHistory && (
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 ml-1">
              {viewToggleOptions.map(v => (
                <button
                  key={v.id}
                  onClick={() => onViewModeChange(v.id)}
                  title={v.tip}
                  className={`p-1.5 rounded-md transition-all ${viewMode === v.id ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-700"}`}
                >
                  <v.Icon size={15} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PMToolbar;
