// ─────────────────────────────────────────────────────────────────────────────
// Global search dataset — aggregated from feature mock/source data.
// Extracted verbatim from the former App.tsx GLOBAL SEARCH OVERLAY section.
// Reports intentionally removed.
// ─────────────────────────────────────────────────────────────────────────────

import { SYSTEMS } from "../features/system-inventory/pages/SystemInventoryPage";
import { DEPT_RECORDS, EMPLOYEES } from "../features/departments/pages/DepartmentsPage";
import { ALL_NOTES } from "../features/notes/pages/NotesPage";

export const SEARCH_ITEMS = [
  ...SYSTEMS.map(s => ({
    type: "Machine",
    label: s.systemName,
    sub: s.systemId + " · " + s.department,
    status: s.status,
  })),
  ...DEPT_RECORDS.map(d => ({
    type: "Department",
    label: d.name,
    sub: d.head + " · " + d.employees + " employees",
    status: d.status,
  })),
  ...EMPLOYEES.map(e => ({
    type: "Employee",
    label: e.name,
    sub: e.role + " · " + e.department,
    status: e.availability,
  })),
  ...ALL_NOTES.map(n => ({
    type: "Note",
    label: n.title,
    sub: n.folder + " · " + n.author,
    status: "",
  })),
];

export const RECENT_SEARCHES = ["HVAC critical alert", "Backup BK-2001", "Rajesh Kumar", "Production PM schedule", "QA Audit July"];

