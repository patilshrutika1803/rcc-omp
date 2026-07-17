import React from "react";
import { Archive, CheckCircle2, XCircle, RefreshCw, Server, TrendingUp } from "lucide-react";
import type { BackupKpi } from "../../utils/backupCalculations";

export function KPICards({ kpi, successRate }: { kpi: BackupKpi; successRate: number }) {
  const cards = [
    { label: "Total Jobs",       val: String(kpi.total),                  icon: Archive,      bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-600",    sub: "All configured"      },
    { label: "Successful",       val: String(kpi.successful),             icon: CheckCircle2, bg: "bg-emerald-50",border: "border-emerald-100", text: "text-emerald-600", sub: "Completed today"     },
    { label: "Failed",           val: String(kpi.failed),                 icon: XCircle,      bg: "bg-red-50",    border: "border-red-100",    text: "text-red-600",     sub: "Needs attention"     },
    { label: "Running Now",      val: String(kpi.running),                icon: RefreshCw,    bg: "bg-blue-50",   border: "border-blue-100",   text: "text-blue-600",    sub: "In progress"         },
    { label: "Storage Used",     val: `${kpi.totalGB} GB`,               icon: Server,       bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600",  sub: "of 2,000 GB"         },
    { label: "Success Rate",     val: `${successRate}%`,                 icon: TrendingUp,   bg: "bg-emerald-50",border: "border-emerald-100", text: "text-emerald-600", sub: "Last 7 days"         },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((k, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{k.label}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg} border ${k.border}`}>
              <k.icon size={15} className={`${k.text} ${k.label === "Running Now" ? "animate-spin" : ""}`} style={k.label === "Running Now" ? { animationDuration: "3s" } : {}} />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mb-1 leading-none">{k.val}</div>
          <div className="text-[11px] font-medium text-slate-400">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
