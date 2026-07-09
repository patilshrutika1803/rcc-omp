import React from "react";
import {
  Info
} from "lucide-react";
// ─────────────────────────────────────────────────────────────────────────────
// SHARED ENTERPRISE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export function ConfirmDialog({ title, description, confirmLabel = "Confirm", confirmClass = "bg-blue-600 hover:bg-blue-700 text-white", icon: Icon = Info, onConfirm, onClose }: {
  title: string; description: string; confirmLabel?: string; confirmClass?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center shrink-0"><Icon size={22} className="text-blue-600" /></div>
          <div><h3 className="text-sm font-bold text-slate-900">{title}</h3><p className="text-xs text-slate-500 mt-0.5">{description}</p></div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function StatusChip({ label, variant }: { label: string; variant: "success" | "warning" | "error" | "info" | "neutral" }) {
  const v = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error:   "bg-red-50 text-red-700 border-red-200",
    info:    "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
  }[variant];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${v}`}>{label}</span>;
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5"><div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + (i * 17) % 40}%` }} /></td>
      ))}
    </tr>
  );
}

export function SectionHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div><h2 className="text-base font-bold text-slate-900">{title}</h2>{subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}</div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
