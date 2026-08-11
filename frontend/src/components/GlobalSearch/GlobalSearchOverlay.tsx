// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SEARCH OVERLAY
// Extracted verbatim from App.tsx — behavior, markup and styling unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Clock,
  Server,
  FileText,
  BookOpen,
  Layers,
  Bell,
  Settings,
  ChevronRight,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { SEARCH_ITEMS, RECENT_SEARCHES } from "../../constants/searchData";

type GlobalSearchItem = (typeof SEARCH_ITEMS)[number];

export function GlobalSearchOverlay({
  onClose,
  onNavigate,
  extraItems = [],
}: {
  onClose: () => void;
  onNavigate: (nav: string) => void;
  extraItems?: GlobalSearchItem[];
}) {
  const [query, setQuery] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const combined = [...SEARCH_ITEMS, ...extraItems];
    return combined
      .filter(item => item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, extraItems]);

  const typeIcon: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Machine: Server,
    Department: Layers,
    Employee: User,
    Note: FileText,
  };
  const typeNav: Record<string, string> = { Machine: "machines", Department: "machines", Employee: "admin", Note: "notes", PM: "maintenance" };

  const grouped = results.reduce((acc, item) => { (acc[item.type] = acc[item.type] || []).push(item); return acc; }, {} as Record<string, typeof results>);

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search machines, employees, notes..."
            className="flex-1 text-sm text-slate-900 bg-transparent border-none focus:outline-none placeholder-slate-400" />
          <div className="flex items-center gap-2">
            <kbd className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">Esc</kbd>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"><X size={16} /></button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Searches</div>
              {RECENT_SEARCHES.map((s, i) => (
                <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left">
                  <Clock size={13} className="text-slate-300 shrink-0" />
                  <span className="text-sm text-slate-600">{s}</span>
                </button>
              ))}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Quick Navigate</div>
              <div className="grid grid-cols-3 gap-2">
                {[["Machines","machines",Server],["Notes","notes",BookOpen],["Notifications","notifications",Bell],["Settings","settings",Settings]].map(([label, nav, Icon]: any) => ( 
                  <button
                    key={label}
                    onClick={() => {
                      onNavigate(nav);
                      onClose();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left"
                  >
                    <Icon size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="p-8 text-center">
              <Search size={24} className="text-slate-200 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-600 mb-1">No results for "{query}"</div>
              <div className="text-xs text-slate-400">Try a different keyword or browse modules.</div>
            </div>
          )}

          {query && Object.entries(grouped).map(([type, items]) => {
            const Icon = typeIcon[type] || FileText;
            return (
              <div key={type}>
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">{type}s</div>
                {items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (item.type === "PM" && item.pmId) {
                        try {
                          window.sessionStorage.setItem("rcc_omp_pm_selected_id", item.pmId);
                        } catch {
                          // ignore
                        }
                        onNavigate("maintenance");
                      } else {
                        onNavigate(typeNav[type] || "dashboard");
                      }
                      onClose();
                      toast.success(`Navigating to ${item.label}`);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50/50 transition-colors text-left border-b border-slate-50">
                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0"><Icon size={13} className="text-blue-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{item.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.sub}</div>
                    </div>
{item.status ? <span className="text-[10px] text-slate-400 shrink-0">{item.status}</span> : null}
                    <ChevronRight size={13} className="text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded text-[9px]">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded text-[9px]">↵</kbd> Open</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded text-[9px]">Esc</kbd> Close</span>
          </div>
          <div className="text-[10px] text-slate-400">{results.length > 0 ? `${results.length} result${results.length !== 1 ? "s" : ""}` : ""}</div>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchOverlay;
