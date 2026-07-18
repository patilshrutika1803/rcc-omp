// ─────────────────────────────────────────────────────────────────────────────
// APP ROUTES (in-shell page switch)
// This is the active-nav -> page-component switch used by the authenticated
// app shell. Navigation is driven by the current browser URL rather than
// component-local state so refreshes and direct links stay stable.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

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
  admin: "/user-management",
  help: "/help",
};

export const ROUTE_TO_NAV: Record<string, string> = Object.entries(NAV_TO_ROUTE).reduce((acc, [nav, route]) => {
  acc[route] = nav;
  return acc;
}, {} as Record<string, string>);

export function getNavIdFromPath(pathname: string): string | null {
  const normalized = pathname.split("?")[0].split("#")[0].toLowerCase();
  if (!normalized || normalized === "/") return "dashboard";
  return ROUTE_TO_NAV[normalized] ?? null;
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
    </>
  );
}

export default AppRoutes;
