// ─────────────────────────────────────────────────────────────────────────────
// Preventive Maintenance — Date Utilities
// Extracted verbatim from PreventiveMaintenancePage.tsx. Logic unchanged.
// ─────────────────────────────────────────────────────────────────────────────

export function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
