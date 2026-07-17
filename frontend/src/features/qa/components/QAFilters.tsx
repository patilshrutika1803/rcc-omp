import { Filter } from "lucide-react";
import { toast } from "sonner";
import { DEPARTMENTS, DEFAULT_FILTERS, REMINDER_OPTIONS } from "../constants/qaConstants";
import type { QAFiltersState } from "../types/qa";

interface QAFiltersProps {
  filters: QAFiltersState;
  setFilters: (filters: QAFiltersState) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export function QAFilters({ filters, setFilters, showFilters, setShowFilters }: QAFiltersProps) {
  return (
    <>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`h-9 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${showFilters || Object.values(filters).some(x => x) ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-600 border border-slate-300'}`}
      >
        <Filter size={14} /> Filter
      </button>

      {showFilters && (
        <div className="absolute top-11 left-[300px] w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-900">Filters</h3>
            <button onClick={() => { setFilters(DEFAULT_FILTERS); toast.success("Filters Reset"); setShowFilters(false); }} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Reset All</button>
          </div>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Department</label><select value={filters.department} onChange={e => setFilters({ ...filters, department: e.target.value })} className="w-full h-8 px-2 text-sm border rounded"><option value="">All Departments</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Reminder</label><select value={filters.reminder} onChange={e => setFilters({ ...filters, reminder: e.target.value })} className="w-full h-8 px-2 text-sm border rounded"><option value="">All Reminders</option>{REMINDER_OPTIONS.map(r => <option key={r}>{r}</option>)}</select></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Completed</label><select value={filters.completed} onChange={e => setFilters({ ...filters, completed: e.target.value })} className="w-full h-8 px-2 text-sm border rounded"><option value="">All</option><option>Pending</option><option>Completed</option></select></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Target Date</label><input type="date" value={filters.targetDate} onChange={e => setFilters({ ...filters, targetDate: e.target.value })} className="w-full h-8 px-2 text-sm border rounded" /></div>
            <button onClick={() => { setShowFilters(false); toast.success("Filters Applied"); }} className="w-full h-8 bg-slate-900 text-white text-xs font-bold rounded-lg mt-2">Apply Filters</button>
          </div>
        </div>
      )}
    </>
  );
}
