// ─────────────────────────────────────────────────────────────────────────────
// System Inventory — Helpers
// ─────────────────────────────────────────────────────────────────────────────

import { Server, Monitor, Laptop, Printer } from "lucide-react";
import type { SystemInventory, SystemStatus } from "../types/system";

export function statusConfig(status: SystemStatus | "") {
  switch (status) {
    case "Active":        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "Inactive":      return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
    case "Under Repair":  return { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" };
    case "Disposed":      return { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" };
    default:              return { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" };
  }
}

export function typeIcon(type: string) {
  switch (type) {
    case "Laptop":     return Laptop;
    case "Desktop PC": return Monitor;
    case "Printer":    return Printer;
    default:           return Server;
  }
}

export function emptySystem(): SystemInventory {
  return {
    systemId: "",
    systemName: "",
    systemType: "",
    systemCategory: "Non-GxP",
    department: "",
    location: "",
    assignedUser: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    status: "Active",
    pmSettings: undefined,
    createdAt: "",
    updatedAt: "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Search / Filter helpers (used by SystemInventoryTable)
// ─────────────────────────────────────────────────────────────────────────────

export function filterSystems(
  systems: SystemInventory[],
  opts: { search: string; department: string; type: string; category: string; status: string }
): SystemInventory[] {
  let d = [...systems];
  if (opts.search) {
    const q = opts.search.toLowerCase();
    d = d.filter(s =>
      s.systemId.toLowerCase().includes(q) ||
      s.systemName.toLowerCase().includes(q) ||
      s.assignedUser.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  }
  if (opts.department) d = d.filter(s => s.department === opts.department);
  if (opts.type) d = d.filter(s => s.systemType === opts.type);
  if (opts.category) d = d.filter(s => s.systemCategory === opts.category);
  if (opts.status) d = d.filter(s => s.status === opts.status);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination helpers
// ─────────────────────────────────────────────────────────────────────────────

export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  return items.slice((page - 1) * perPage, page * perPage);
}

export function totalPagesFor(count: number, perPage: number): number {
  return Math.max(1, Math.ceil(count / perPage));
}

// ─────────────────────────────────────────────────────────────────────────────
// Form validation helper (used by AddSystemModal)
// ─────────────────────────────────────────────────────────────────────────────

export function validateSystemForm(form: SystemInventory): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.systemType) e.systemType = "System Type is required";
  if (!form.systemCategory) e.systemCategory = "Machine Category is required";
  if (!form.department) e.department = "Department is required";
  if (!form.location.trim()) e.location = "Location is required";
  if (!form.systemId.trim()) e.systemId = "System ID is required";
  if (!form.systemName.trim()) e.systemName = "System Name is required";
  if (!form.assignedUser.trim()) e.assignedUser = "Assigned User is required";
  return e;
}

export function exportSystemsAsCsv(systems: SystemInventory[]) {
  const format = (value: string) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = [
    "System ID",
    "System Name",
    "System Type",
    "Category",
    "Department",
    "Location",
    "Assigned User",
    "Brand",
    "Model",
    "Serial Number",
    "Purchase Date",
    "Warranty Expiry",
    "Status",
  ];

  const csvRows = systems.map(system => [
    system.systemId,
    system.systemName,
    system.systemType,
    system.systemCategory,
    system.department,
    system.location,
    system.assignedUser,
    system.brand,
    system.model,
    system.serialNumber,
    system.purchaseDate,
    system.warrantyExpiry,
    system.status,
  ].map(format).join(","));

  const csv = [header.map(format).join(","), ...csvRows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute("download", `system-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
