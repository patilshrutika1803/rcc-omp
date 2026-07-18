// ─────────────────────────────────────────────────────────────────────────────
// APP ROUTES (in-shell page switch)
// This is the active-nav -> page-component switch used by the authenticated
// app shell. Navigation is driven by the current browser URL rather than
// component-local state so refreshes and direct links stay stable.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { LayoutDashboard } from "lucide-react";

import DashboardPage from "../features/dashboard/DashboardPage";
import PreventiveMaintenancePage from "../features/preventive-maintenance/PreventiveMaintenancePage";
import BackupActivitiesPage from "../features/backup/BackupActivitiesPage";
import QAPage from "../features/qa/QAPage";
import SystemInventoryPage from "../features/system-inventory/SystemInventoryPage";
import DepartmentPage from "../features/departments/DepartmentPage";

import NotificationsPage from "../features/notificataions/pages/NotificationsPage";
import NotesPage from "../features/notes/pages/NotesPage";
import SettingsPage from "../features/settings/pages/SettingsPage";

import { UserProfileContent } from "../modules/profile/UserProfileContent";
import { RoleManagementContent } from "../modules/admin/RoleManagementContent";
import { HelpCenterContent } from "../modules/help/HelpCenterContent";

import { NAV_ITEMS } from "../constants/navigation";

export const KNOWN_NAV_IDS = ["dashboard","maintenance","backup","qa","machines","departments","notifications","notes","settings","profile","admin","help"];

export const NAV_TO_ROUTE: Record<string, string> = {
  dashboard: "/dashboard",
  maintenance: "/preventive-maintenance",
  backup: "/backup-activities",
  qa: "/qa-activities",
  machines: "/system-inventory",
  departments: "/departments",
  notifications: "/notifications",
  notes: "/notes",
  settings: "/settings",
  profile: "/profile",
  admin: "/admin",
  help: "/help",
};

export const ROUTE_TO_NAV: Record<string, string> = Object.entries(NAV_TO_ROUTE).reduce((acc, [nav, route]) => {
  acc[route] = nav;
  return acc;
}, {} as Record<string, string>);

export function getNavIdFromPath(pathname: string) {
  const normalized = pathname.split("?")[0].split("#")[0].toLowerCase();
  if (!normalized || normalized === "/") return "dashboard";
  return ROUTE_TO_NAV[normalized] ?? "dashboard";
}

export function getRouteFromNavId(navId: string) {
  return NAV_TO_ROUTE[navId] ?? "/dashboard";
}

export function AppRoutes({ activeNav }: { activeNav: string }) {
  return (
    <>
      {activeNav === "dashboard" && <DashboardPage />}
      {activeNav === "maintenance" && <PreventiveMaintenancePage />}
      {activeNav === "backup" && <BackupActivitiesPage />}
      {activeNav === "qa" && <QAPage />}
      {activeNav === "machines" && <SystemInventoryPage />}
      {activeNav === "departments" && <DepartmentPage />}
      {activeNav === "notifications" && <NotificationsPage />}
      {activeNav === "notes" && <NotesPage />}
      {activeNav === "settings" && <SettingsPage />}
      {activeNav === "profile" && <UserProfileContent />}
      {activeNav === "admin" && <RoleManagementContent />}
      {activeNav === "help" && <HelpCenterContent />}
      {!KNOWN_NAV_IDS.includes(activeNav) && (
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4"><LayoutDashboard size={24} className="text-blue-600" /></div>
          <h2 className="text-lg font-bold text-slate-900">{NAV_ITEMS.find(n => n.id === activeNav)?.label}</h2>
          <p className="text-sm text-slate-500 max-w-sm mt-2">This module is under development.</p>
        </div>
      )}
    </>
  );
}

export default AppRoutes;
