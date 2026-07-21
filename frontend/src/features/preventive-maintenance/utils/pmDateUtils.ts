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

/**
 * Calculate the next due date based on last maintenance date and frequency.
 * Rules:
 * - Weekly → +7 days
 * - Monthly → +1 month
 * - Quarterly → +3 months
 * - Half-Yearly → +6 months
 * - Yearly → +12 months
 */
export function calculateNextDue(lastMaintenance: string, frequency: string): string {
  const d = new Date(lastMaintenance);
  if (isNaN(d.getTime())) return "";

  switch (frequency) {
    case "Weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "Bi-Weekly":
      d.setDate(d.getDate() + 14);
      break;
    case "Monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "Quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "Half-Yearly":
      d.setMonth(d.getMonth() + 6);
      break;
    case "Yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      // Daily or unknown frequency — default to +1 day
      d.setDate(d.getDate() + 1);
      break;
  }

  return d.toISOString().split("T")[0];
}
