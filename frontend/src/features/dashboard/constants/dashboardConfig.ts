// ─────────────────────────────────────────────────────────────────────────────
// Dashboard static configuration
// Non-data constants only (icons, labels, headers). No sample/demo data here.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Archive,
  Wrench,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Icon + color mapping for KPI cards, keyed by the KPI label returned from the service.
// The service supplies label/val; the component maps label -> visual config here.
export const KPI_VISUAL_CONFIG: Record<
  string,
  { icon: typeof Archive; color: string; bg: string; border: string }
> = {
  "Today's Backups": { icon: Archive, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  "Today's PM": { icon: Wrench, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  "Today's QA": { icon: CheckSquare, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  "Pending Tasks": { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  "Completed Today": { icon: CheckCircle2, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
  "Overdue Tasks": { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
};

export const CALENDAR_WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export const WORK_QUEUE_TABLE_HEADERS = ["Task ID", "Description", "Type", "Priority", "Status"];
