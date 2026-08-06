import { CalendarClock, Calendar as CalendarIcon, CheckCircle2, AlertTriangle, Server } from "lucide-react";

export interface InspectionKPI {
  total: number;
  dueToday: number;
  upcoming: number;
  completed: number;
  overdue: number;
}

export function InspectionKPISection({ kpis }: { kpis: InspectionKPI }) {
  const cards = [
    {
      label: "Total Inspections",
      value: kpis.total,
      icon: Server,
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600",
      sub: "Active cycles",
      subColor: "text-blue-400",
    },
    {
      label: "Due Today",
      value: kpis.dueToday,
      icon: CalendarClock,
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-600",
      sub: "Requires action",
      subColor: "text-amber-400",
    },
    {
      label: "Upcoming",
      value: kpis.upcoming,
      icon: CalendarIcon,
      bg: "bg-slate-50",
      border: "border-slate-100",
      text: "text-slate-600",
      sub: "Scheduled ahead",
      subColor: "text-slate-400",
    },
    {
      label: "Completed",
      value: kpis.completed,
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-600",
      sub: "History logged",
      subColor: "text-emerald-400",
    },
    {
      label: "Overdue",
      value: kpis.overdue,
      icon: AlertTriangle,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-600",
      sub: "Immediate attention",
      subColor: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white border rounded-2xl shadow-sm p-4 border-slate-200">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{card.label}</div>
                <div className={`text-2xl font-bold ${card.text}`}>{card.value}</div>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.bg} ${card.border}`}>
                <Icon size={18} className={card.text} />
              </div>
            </div>
            <div className={`text-[11px] font-medium ${card.subColor}`}>{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
