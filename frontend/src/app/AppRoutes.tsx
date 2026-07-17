// ─────────────────────────────────────────────────────────────────────────────
// APP ROUTES (in-shell page switch)
// Extracted verbatim from the former DashboardApp component's <main> content
// in App.tsx. This is the activeNav -> page-component switch used by the
// authenticated app shell (distinct from the top-level react-router routes
// defined in app/App.tsx).
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { LayoutDashboard } from "lucide-react";

import DashboardPage from "../features/dashboard/pages/DashboardPage";
import PreventiveMaintenancePage from "../features/preventive-maintenance/pages/PreventiveMaintenancePage";
import BackupActivitiesPage from "../features/backup/pages/BackupActivitiesPage";
import QAPage from "../features/qa/pages/QAPage";
import SystemInventoryPage from "../features/system-inventory/SystemInventoryPage";
import DepartmentPage from "../features/departments/DepartmentPage";

import NotificationsPage from "../features/notificataions/pages/NotificationsPage";
import NotesPage from "../features/notes/pages/NotesPage";
import SettingsPage from "../features/settings/pages/SettingsPage";

import { UserProfileContent } from "../modules/profile/UserProfileContent";
import { RoleManagementContent } from "../modules/admin/RoleManagementContent";
import { HelpCenterContent } from "../modules/help/HelpCenterContent";

import { NAV_ITEMS } from "../constants/navigation";

const KNOWN_NAV_IDS = ["dashboard","maintenance","backup","qa","machines","departments","notifications","notes","settings","profile","admin","help"];

export function AppRoutes({ activeNav }: { activeNav: string }) {
  return (
    <>
      {activeNav === "dashboard"   && <DashboardPage />}
      {activeNav === "maintenance" && <PreventiveMaintenancePage />}
      {activeNav === "backup"      && <BackupActivitiesPage />}
      {activeNav === "qa"          && <QAPage />}
      {activeNav === "machines"     && <SystemInventoryPage />}

      {activeNav === "departments"  && <DepartmentPage />}

      {activeNav === "notifications"&& <NotificationsPage />}
      {activeNav === "notes"        && <NotesPage />}
      {activeNav === "settings"     && <SettingsPage />}
      {activeNav === "profile"      && <UserProfileContent />}
      {activeNav === "admin"        && <RoleManagementContent />}
      {activeNav === "help"         && <HelpCenterContent />}
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
