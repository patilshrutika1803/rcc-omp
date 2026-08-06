// ─────────────────────────────────────────────────────────────────────────────
// SHARED DATE HELPERS
// Moved verbatim from the original App.tsx. Used across multiple features
// (PM, QA, Machines, Departments, App shell) — centralized here since more
// than one feature page depended on identical logic. Behavior is unchanged
// from the original monolith.
// ─────────────────────────────────────────────────────────────────────────────

export function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();

  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
