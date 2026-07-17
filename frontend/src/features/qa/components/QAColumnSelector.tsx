import { Columns } from "lucide-react";
import type { QAColumnsState } from "../types/qa";

interface QAColumnSelectorProps {
  columns: QAColumnsState;
  setColumns: (columns: QAColumnsState) => void;
  showColumns: boolean;
  setShowColumns: (show: boolean) => void;
}

export function QAColumnSelector({ columns, setColumns, showColumns, setShowColumns }: QAColumnSelectorProps) {
  return (
    <>
      <button onClick={() => setShowColumns(!showColumns)} className="h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg flex items-center gap-1.5 ml-auto">
        <Columns size={14} /> Columns
      </button>

      {showColumns && (
        <div className="absolute top-11 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
          {Object.keys(columns).map(col => (
            <label key={col} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={(columns as any)[col]}
                onChange={e => setColumns({ ...columns, [col]: e.target.checked })}
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm font-medium text-slate-700 capitalize">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
      )}
    </>
  );
}
