import React from "react";
import {
  LayoutDashboard,
  Wrench,
  Archive,
  CheckSquare,
  Server,
  BarChart2,
  Bell,
  FileText,
  Settings,
  HardDrive,
  ClipboardList,
} from "lucide-react";

export type NavItem = {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "maintenance", icon: Wrench, label: "Preventive Maintenance" },
  { id: "backup", icon: Archive, label: "Backup Activities" },
  { id: "monthly-hard-disk", icon: HardDrive, label: "Monthly Hard Disk Tracker" },
  { id: "qa", icon: CheckSquare, label: "QA Activities" },
  { id: "machines", icon: Server, label: "System Inventory" },
  { id: "inspection-schedule", icon: ClipboardList, label: "Inspection Schedule" },

  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "notes", icon: FileText, label: "Notes" },
  { id: "settings", icon: Settings, label: "Settings" },
];
