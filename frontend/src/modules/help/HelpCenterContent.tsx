// ─────────────────────────────────────────────────────────────────────────────
// HELP CENTER
// Extracted verbatim from App.tsx — behavior, markup and styling unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
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
  Search,
  ArrowLeft,
  AlertCircle,
  Lightbulb,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";

import { StatusChip } from "../../shared/components/EnterpriseUI";
import {
  DOCUMENTATION_ENTRIES,
  DocumentationEntry,
  searchDocumentation,
} from "./documentationData";

export function HelpCenterContent() {
  const [tab, setTab] = useState<"faq" | "docs" | "tickets" | "status" | "releases">("faq");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentationEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) {
      return DOCUMENTATION_ENTRIES;
    }
    return searchDocumentation(searchQuery);
  }, [searchQuery]);

  const TABS = [{ id: "faq" as const, label: "FAQ" }, { id: "docs" as const, label: "Documentation" }, { id: "tickets" as const, label: "Support Tickets" }, { id: "status" as const, label: "System Status" }, { id: "releases" as const, label: "Release Notes" }];

  const FAQS: { q: string; a: string }[] = [];

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
        <div>
          {selectedDoc ? (
            // Detail View
            <div className="max-w-4xl">
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setSearchQuery("");
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-6 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Documentation
              </button>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <BookOpen size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900">{selectedDoc.title}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-semibold bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">
                          {selectedDoc.category}
                        </span>
                        <span className="text-xs text-slate-500">Updated {selectedDoc.updated}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-6">
                  {/* Description */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Overview</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedDoc.shortDescription}</p>
                  </section>

                  {/* Purpose */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Purpose</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedDoc.purpose}</p>
                  </section>

                  {/* How to Use */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckSquare size={16} className="text-blue-600" />
                      How to Use
                    </h3>
                    <ol className="space-y-2">
                      {selectedDoc.howToUse.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-slate-600">
                          <span className="font-semibold text-blue-600 shrink-0 w-5">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </section>

                  {/* Important Actions */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Important Actions & Buttons</h3>
                    <div className="grid gap-2">
                      {selectedDoc.importantActions.map((action, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-slate-700"
                        >
                          <span className="font-semibold text-blue-600 shrink-0">→</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Tips */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Lightbulb size={16} className="text-amber-500" />
                      Useful Tips
                    </h3>
                    <ul className="space-y-2">
                      {selectedDoc.tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-slate-600">
                          <span className="text-amber-500 shrink-0 mt-0.5">◆</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Common Mistakes */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500" />
                      Common Mistakes & Things to Remember
                    </h3>
                    <ul className="space-y-2">
                      {selectedDoc.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-slate-600">
                          <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            // List View
            <div>
              {/* Search Bar */}
              <div className="mb-6 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documentation by module name or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Documentation Cards */}
              {filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30 transition-all p-5 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                          <BookOpen size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {doc.title}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mb-2.5">
                            {doc.shortDescription}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">
                              {doc.category}
                            </span>
                            <span>·</span>
                            <span>Updated {doc.updated}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 shrink-0 transition-colors mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-500 text-center">
                  <Search size={20} className="mx-auto mb-2 text-slate-400" />
                  No documentation found matching "{searchQuery}". Try different keywords.
                </div>
              )}
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
