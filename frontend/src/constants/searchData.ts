// ─────────────────────────────────────────────────────────────────────────────
// Global search dataset — aggregated from feature mock/source data.
// Extracted verbatim from the former App.tsx GLOBAL SEARCH OVERLAY section.
// Reports intentionally removed.
// ─────────────────────────────────────────────────────────────────────────────

import { SystemInventory } from "../features/system-inventory/types/system";
// import { getSystems } from "../features/system-inventory/services/systemInventoryService";
import { ALL_NOTES } from "../features/notes/pages/NotesPage";





// Departments feature has been refactored to a modular architecture.

// searchData.ts should not depend on the removed monolithic DepartmentsPage.
// Until the backend is wired, department/employee search entries are empty.
const DEPT_RECORDS: any[] = [];
const EMPLOYEES: any[] = [];

// Note: search overlay runs synchronously, so we can’t rely on async
// service calls here. Until the backend is wired, the system service
// returns an empty list.
const SYSTEMS: SystemInventory[] = [];

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

