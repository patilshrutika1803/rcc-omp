// ─────────────────────────────────────────────────────────────────────────────
// MOBILE DRAWER
// Extracted verbatim from the former DashboardApp component in App.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Monitor, X } from "lucide-react";
import { NAV_ITEMS } from "../constants/navigation";

export function MobileDrawer({
  isOpen,
  onClose,
  activeNav,
  setActiveNav,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 left-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Monitor size={16} className="text-white" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-bold text-slate-900 tracking-tight">RCC OMP</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="text-[10px] font-bold text-slate-400 tracking-widest px-5 mb-2">MAIN MENU</div>
          <nav className="px-3 space-y-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); onClose(); }}
                className={`w-full flex items-center h-10 px-3 rounded-lg transition-colors ${activeNav === item.id ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}
              >
                <item.icon size={18} className={activeNav === item.id ? "text-blue-600" : "text-slate-400"} />
                <span className="ml-3 text-sm">{item.label}</span>
                {item.badge && <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default MobileDrawer;
