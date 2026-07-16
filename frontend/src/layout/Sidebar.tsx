// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SIDEBAR
// Extracted verbatim from the former DashboardApp component in App.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Monitor, LogOut } from "lucide-react";
import { NAV_ITEMS } from "../constants/navigation";

export function Sidebar({
  isSidebarCollapsed,
  activeNav,
  setActiveNav,
  onLogout,
}: {
  isSidebarCollapsed: boolean;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onLogout: () => void;
}) {
  return (
    <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-20 ${isSidebarCollapsed ? "w-[68px]" : "w-64"}`}>
      <div className="flex items-center h-16 px-4 border-b border-slate-100 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Monitor size={16} className="text-white" />
        </div>
        {!isSidebarCollapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <div className="text-sm font-bold text-slate-900 tracking-tight">RCC OMP</div>
            <div className="text-[10px] text-slate-400 tracking-wider font-semibold">PORTAL</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {!isSidebarCollapsed && <div className="text-[10px] font-bold text-slate-400 tracking-widest px-5 mb-2">MAIN MENU</div>}
        <nav className="px-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center h-10 px-2 rounded-lg transition-colors group relative ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon size={18} className={`shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                {!isSidebarCollapsed && <span className={`ml-3 text-sm font-medium ${isActive ? "font-semibold" : ""}`}>{item.label}</span>}
                {!isSidebarCollapsed && item.badge && (
                  <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                )}
                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-100 shrink-0">
        <button onClick={onLogout} className="w-full flex items-center h-10 px-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors" title={isSidebarCollapsed ? "Logout" : undefined}>
          <LogOut size={18} className="shrink-0" />
          {!isSidebarCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
