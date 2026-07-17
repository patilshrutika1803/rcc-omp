// ─────────────────────────────────────────────────────────────────────────────
// PROFILE DROPDOWN
// Extracted verbatim from the former DashboardApp component's header section
// in App.tsx (the avatar trigger button + its dropdown menu).
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { ChevronDown, User, Settings, HelpCircle, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export function ProfileDropdown({
  isOpen,
  onToggle,
  onClose,
  setActiveNav,
  onLogout,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  setActiveNav: (nav: string) => void;
  onLogout: () => void;
}) {
  const { user } = useAuth();
  const displayName = user?.name ?? "RCC OMP User";
  const displayEmail = user?.email ?? "unknown@example.com";
  const initials = displayName
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button className="flex items-center gap-2 lg:gap-3 p-1 rounded-lg hover:bg-slate-50 transition-colors" onClick={onToggle}>
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">{initials}</div>
        <div className="hidden lg:block text-left">
          <div className="text-sm font-semibold text-slate-900 leading-tight">{displayName}</div>
          <div className="text-[11px] text-slate-500 font-medium">Portal User</div>
        </div>
        <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-sm font-bold text-slate-900">{displayName}</div>
              <div className="text-xs text-slate-500">{displayEmail}</div>
            </div>
            <div className="py-1">
              <button onClick={() => { setActiveNav("profile"); onClose(); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><User size={14} /> My Profile</button>
              <button onClick={() => { setActiveNav("settings"); onClose(); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><Settings size={14} /> Preferences</button>
              <button onClick={() => { setActiveNav("help"); onClose(); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><HelpCircle size={14} /> Help Center</button>
              <button onClick={() => { setActiveNav("admin"); onClose(); }} className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"><ShieldCheck size={14} /> User Management</button>
            </div>
            <div className="py-1 border-t border-slate-100">
              <button onClick={onLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={14} /> Sign Out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileDropdown;
