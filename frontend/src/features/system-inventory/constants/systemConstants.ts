// ─────────────────────────────────────────────────────────────────────────────
// System Inventory — Constants
// ─────────────────────────────────────────────────────────────────────────────

export const DEPARTMENTS = [
  "Quality Assurance",
  "Quality Control",
  "Production",
  "Warehouse",
  "Engineering",
  "Purchase & Accounts",
  "HR & Admin",
  "Environmental Health & Safety",
  "IT Department",
];

// Only these three system types are supported.
export const SYSTEM_TYPES = ["Laptop", "Desktop PC", "Printer"] as const;
export const SYSTEM_CATEGORIES = ["GxP", "Non-GxP"] as const;

export const STATUS_OPTIONS = ["Active", "Inactive", "Under Repair", "Disposed"] as const;

// Preventive Maintenance is only applicable to Laptop / Desktop PC.
// Printers never participate in PM.
export const PM_ELIGIBLE_TYPES = ["Laptop", "Desktop PC"];

export const PM_FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly"] as const;
export const PM_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
export const PM_REMINDERS = ["Same Day", "1 Day Before", "3 Days Before", "1 Week Before"] as const;

// Table pagination page size (unchanged from original inline value).
export const SYSTEMS_PER_PAGE = 8;
