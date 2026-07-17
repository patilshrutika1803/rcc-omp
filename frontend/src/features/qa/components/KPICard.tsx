import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export function KPICard({ label, value, icon: Icon, color, bg }: KPICardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${bg}`}>
          <Icon size={14} className={color} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
