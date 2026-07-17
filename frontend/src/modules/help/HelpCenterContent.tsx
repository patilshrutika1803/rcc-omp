// ─────────────────────────────────────────────────────────────────────────────
// HELP CENTER
// Extracted verbatim from App.tsx — behavior, markup and styling unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  LayoutDashboard,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Eye,
  Download,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { StatusChip } from "../../shared/components/EnterpriseUI";

export function HelpCenterContent() {
  const [tab, setTab] = useState<"faq" | "docs" | "tickets" | "status" | "releases">("faq");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const TABS = [{ id: "faq" as const, label: "FAQ" }, { id: "docs" as const, label: "Documentation" }, { id: "tickets" as const, label: "Support Tickets" }, { id: "status" as const, label: "System Status" }, { id: "releases" as const, label: "Release Notes" }];

  const FAQS: { q: string; a: string }[] = [];

  const DOCS: { title: string; category: string; pages: number; updated: string }[] = [];

  const TICKETS: { id: string; subject: string; priority: string; status: string; created: string; assignee: string }[] = [];

  const SERVICES: { name: string; status: "Operational" | "Degraded" | "Error"; uptime: string }[] = [];

  const RELEASES: { version: string; date: string; highlights: string[] }[] = [];
  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} /><span>Dashboard</span><ChevronRight size={12} /><span className="text-slate-700 font-semibold">Help Center</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200"><HelpCircle size={20} className="text-white" /></div>
            <div><h1 className="text-xl font-bold text-slate-900 tracking-tight">Help Center</h1><p className="text-xs text-slate-500 mt-0.5">Documentation, FAQs, support and system status</p></div>
          </div>
          <button onClick={() => toast.success("Support ticket created!")} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><MessageSquare size={13} /> New Support Ticket</button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5">
        <div className="flex overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab === "faq" && (
        <div className="max-w-3xl">
          {FAQS.length > 0 ? (
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={16} className="text-blue-600 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                  </button>
                  {openFaq === i && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500 text-center">
              No help articles are available yet. Add FAQs once documentation is ready.
            </div>
          )}
        </div>
      )}

      {tab === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {DOCS.length > 0 ? DOCS.map((doc, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0"><BookOpen size={18} className="text-blue-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 mb-1">{doc.title}</div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">{doc.category}</span>
                  <span>{doc.pages} pages</span><span>·</span><span>Updated {doc.updated}</span>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button className="h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><Eye size={11} /></button>
                <button onClick={() => toast.success("Downloading...")} className="h-7 px-2.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"><Download size={11} /></button>
              </div>
            </div>
          )) : (
            <div className="col-span-1 lg:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500 text-center">
              No documentation entries are available yet. Upload or link documentation once available.
            </div>
          )}
        </div>
      )}

      {tab === "tickets" && (
        <div className="space-y-4">
          {TICKETS.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr><th className="px-5 py-3">Ticket</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assignee</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TICKETS.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-bold text-slate-900">{t.subject}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{t.id}</div>
                      </td>
                      <td className="px-4 py-3.5"><StatusChip label={t.priority} variant={t.priority === "Critical" ? "error" : t.priority === "High" ? "warning" : t.priority === "Medium" ? "info" : "neutral"} /></td>
                      <td className="px-4 py-3.5"><StatusChip label={t.status} variant={t.status === "Resolved" ? "success" : t.status === "In Progress" ? "info" : "warning"} /></td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{t.assignee}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{t.created}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="h-7 px-2.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500 text-center">
              No support tickets have been created yet. Submit a request to begin tracking issues.
            </div>
          )}
        </div>
      )}

      {tab === "status" && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div><div className="text-sm font-bold text-emerald-900">All Core Systems Operational</div><div className="text-xs text-emerald-700 mt-0.5">Last checked: July 3, 2026 at 10:00 IST</div></div>
          </div>
          {SERVICES.length > 0 ? SERVICES.map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${s.status === "Operational" ? "bg-emerald-500" : s.status === "Degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                <span className="text-sm font-semibold text-slate-900">{s.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="font-mono">{s.uptime} uptime (30d)</span>
                <StatusChip label={s.status} variant={s.status === "Operational" ? "success" : s.status === "Degraded" ? "warning" : "error"} />
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500 text-center">
              No system status entries are available. Service health will be shown here after the first status refresh.
            </div>
          )}
        </div>
      )}

      {tab === "releases" && (
        <div className="max-w-2xl space-y-4">
          {RELEASES.length > 0 ? RELEASES.map((r, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">v{r.version}</span>
                  {i === 0 && <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">Latest</span>}
                </div>
                <span className="text-xs text-slate-400">{r.date}</span>
              </div>
              <ul className="space-y-1.5">
                {r.highlights.map((h, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-slate-600"><CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />{h}</li>
                ))}
              </ul>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500 text-center">
              No release notes are available yet. Publish release information once changes are deployed.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HelpCenterContent;
