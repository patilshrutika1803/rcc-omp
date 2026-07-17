// ─────────────────────────────────────────────────────────────────────────────
// Preventive Maintenance — Helper Functions
// Extracted verbatim from PreventiveMaintenancePage.tsx. Logic unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Cpu,
  Layers,
  Archive,
  Zap,
  CheckSquare,
  Server,
} from "lucide-react";
import type { PMStatus, PMPriority } from "../types/pm";

export function statusConfig(status: PMStatus) {
  switch (status) {
    case "Due Today":    return { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-600" };
    case "Overdue":     return { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "bg-red-600" };
    case "Upcoming":    return { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400" };
    case "Completed":   return { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-500" };
    case "In Progress": return { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-500" };
    case "Scheduled":   return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" };
    default:            return { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400" };
  }
}

export function priorityConfig(priority: PMPriority) {
  switch (priority) {
    case "Critical": return { bg: "bg-red-50",    text: "text-red-700",    icon: "text-red-600" };
    case "High":     return { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500" };
    case "Medium":   return { bg: "bg-amber-50",  text: "text-amber-700",  icon: "text-amber-500" };
    case "Low":      return { bg: "bg-slate-50",  text: "text-slate-600",  icon: "text-slate-400" };
  }
}

export function machineIcon(dept: string) {
  switch (dept) {
    case "IT Department": return Cpu;
    case "Production": return Layers;
    case "Warehouse": return Archive;
    case "Engineering": return Zap;
    case "Quality Control": return CheckSquare;
    default: return Server;
  }
}
