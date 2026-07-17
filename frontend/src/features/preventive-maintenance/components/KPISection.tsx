import React from "react";
import { Wrench, CalendarClock, Calendar as CalendarIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import { KPICard, type KPICardData } from "./KPICard";

export interface PMKpis {
  total: number;
  dueToday: number;
  upcoming: number;
  completed: number;
  overdue: number;
}

export function KPISection({ kpis }: { kpis: PMKpis }) {
  const cards: KPICardData[] = [
    {
      label: "Total PM", val: kpis.total, icon: Wrench,
      bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600",
      sub: "All schedules", subColor: "text-blue-400"
    },
    {
      label: "Due Today", val: kpis.dueToday, icon: CalendarClock,
      bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600",
      sub: "Requires attention", subColor: "text-amber-400"
    },
    {
      label: "Upcoming", val: kpis.upcoming, icon: CalendarIcon,
      bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-600",
      sub: "Scheduled ahead", subColor: "text-slate-400"
    },
    {
      label: "Completed", val: kpis.completed, icon: CheckCircle2,
      bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600",
      sub: "This period", subColor: "text-emerald-400"
    },
    {
      label: "Overdue", val: kpis.overdue, icon: AlertTriangle,
      bg: "bg-red-50", border: "border-red-100", text: "text-red-600",
      sub: "Immediate action", subColor: "text-red-400"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((kpi, i) => (
        <KPICard key={i} kpi={kpi} />
      ))}
    </div>
  );
}

export default KPISection;
