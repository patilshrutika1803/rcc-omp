import React, { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { SystemInventory } from "../../system-inventory/types/system";

// Replaces free-typed Machine ID entry. Lists only Laptop / Desktop PC systems
// pulled from System Inventory (Printers are excluded — they don't get PM).
export function SystemSearchDropdown({
  systems,
  selected,
  onSelect,
  hasError,
}: {
  systems: SystemInventory[];
  selected: SystemInventory | null;
  onSelect: (system: SystemInventory) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return systems;
    const q = query.toLowerCase();
    return systems.filter(s =>
      s.systemId.toLowerCase().includes(q) ||
      s.systemName.toLowerCase().includes(q) ||
      s.assignedUser.toLowerCase().includes(q)
    );
  }, [systems, query]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full h-9 px-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between gap-2 ${hasError ? "border-red-400" : "border-slate-300"}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 truncate">
            <span className="font-mono text-xs font-semibold text-slate-700">{selected.systemId}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-700 truncate">{selected.systemName}</span>
          </span>
        ) : (
          <span className="text-slate-400">Search and select a system...</span>
        )}
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search System ID, name or user..."
                className="w-full h-8 pl-8 pr-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 text-center">No matching systems</div>
            ) : (
              filtered.map(s => (
                <button
                  key={s.systemId}
                  type="button"
                  onClick={() => { onSelect(s); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between gap-2 ${selected?.systemId === s.systemId ? "bg-blue-50" : ""}`}
                >
                  <span className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 truncate">{s.systemName}</span>
                    <span className="text-slate-400 font-mono">{s.systemId} · {s.systemType} · {s.department}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemSearchDropdown;
