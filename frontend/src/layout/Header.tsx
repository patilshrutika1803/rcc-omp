// ─────────────────────────────────────────────────────────────────────────────
// TOP HEADER
// Extracted verbatim from the former DashboardApp component in App.tsx
// (everything inside the <header> element).
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Menu, PanelLeft, PanelLeftClose, Search, Bell } from "lucide-react";
import { ProfileDropdown } from "./ProfileDropdown";

export function Header({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onOpenMobileDrawer,
  onOpenSearch,
  isProfileMenuOpen,
  onToggleProfileMenu,
  onCloseProfileMenu,
  setActiveNav,
  onLogout,
}: {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  onOpenMobileDrawer: () => void;
  onOpenSearch: () => void;
  isProfileMenuOpen: boolean;
  onToggleProfileMenu: () => void;
  onCloseProfileMenu: () => void;
  setActiveNav: (nav: string) => void;
  onLogout: () => void;
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
      <div className="flex items-center flex-1 gap-4">
        <button className="lg:hidden p-1 text-slate-500 hover:text-slate-900" onClick={onOpenMobileDrawer}>
          <Menu size={20} />
        </button>
        <button className="hidden lg:flex p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <button onClick={onOpenSearch} className="hidden sm:flex items-center gap-2 w-64 max-w-md h-9 pl-3 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-white transition-all text-slate-400">
          <Search size={15} className="shrink-0" />
          <span className="flex-1 text-left text-sm">Search everywhere...</span>
          <kbd className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded border border-slate-300 shrink-0">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <div className="hidden md:block text-xs font-medium text-slate-500">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </div>
        <button onClick={() => setActiveNav("notifications")} className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="w-px h-6 bg-slate-200 hidden sm:block" />
        <ProfileDropdown
          isOpen={isProfileMenuOpen}
          onToggle={onToggleProfileMenu}
          onClose={onCloseProfileMenu}
          setActiveNav={setActiveNav}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}

export default Header;
