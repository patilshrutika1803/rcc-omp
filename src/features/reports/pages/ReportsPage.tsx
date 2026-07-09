// ─────────────────────────────────────────────────────────────────────────────
// ReportsPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  LayoutDashboard,
  BarChart2,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle2,
  Check,
  Plus,
  Activity,
  ChevronLeft,
  Download,
  FileSpreadsheet,
  Eye,
  Edit2,
  Trash2,
  CalendarClock,
  ExternalLink,
  Send,
  Type,
  Repeat,
  PlayCircle
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import { ConfirmDialog, StatusChip, SkeletonRow, SectionHeader } from "../../../shared/components/EnterpriseUI";

const DEPARTMENTS = ["Quality Assurance", "Quality Control", "Production", "Warehouse", "Engineering", "Purchase & Accounts", "HR & Admin", "Environmental Health & Safety", "IT Department"];

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS MODULE
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_REPORTS = [
  { id: "RPT-001", title: "Monthly Operations Summary – July 2026", category: "Monthly", dept: "All Departments", type: "Summary", date: "2026-07-01", size: "4.8 MB", pages: 24, status: "Ready", views: 18 },
  { id: "RPT-002", title: "Production Department – Q2 2026 Performance", category: "Performance", dept: "Production", type: "Performance", date: "2026-07-03", size: "3.2 MB", pages: 18, status: "Ready", views: 11 },
  { id: "RPT-003", title: "IT Infrastructure – Maintenance & Uptime", category: "Maintenance", dept: "IT Department", type: "Maintenance", date: "2026-07-02", size: "2.1 MB", pages: 12, status: "Ready", views: 9 },
  { id: "RPT-004", title: "Quality Control – QA Audit Report June 2026", category: "QA", dept: "Quality Control", type: "QA", date: "2026-07-01", size: "1.8 MB", pages: 10, status: "Ready", views: 14 },
  { id: "RPT-005", title: "All Departments – Backup Activity Summary", category: "Backup", dept: "IT Department", type: "Backup", date: "2026-07-03", size: "1.4 MB", pages: 8, status: "Ready", views: 7 },
  { id: "RPT-006", title: "Plant-Wide Machine Health & Asset Report", category: "Machine", dept: "All Departments", type: "Machine", date: "2026-07-02", size: "5.6 MB", pages: 32, status: "Ready", views: 22 },
  { id: "RPT-007", title: "Engineering Department – Energy Audit Report", category: "Performance", dept: "Engineering", type: "Performance", date: "2026-06-30", size: "2.8 MB", pages: 15, status: "Under Review", views: 5 },
  { id: "RPT-008", title: "HR & Administration – Q2 Compliance Report", category: "Monthly", dept: "HR & Admin", type: "Summary", date: "2026-06-28", size: "1.1 MB", pages: 6, status: "Ready", views: 4 },
  { id: "RPT-009", title: "Annual Maintenance Cost Analysis – 2025", category: "Yearly", dept: "All Departments", type: "Maintenance", date: "2026-01-10", size: "8.4 MB", pages: 48, status: "Ready", views: 34 },
  { id: "RPT-010", title: "Q1 2026 Executive Summary", category: "Executive", dept: "All Departments", type: "Summary", date: "2026-04-05", size: "3.0 MB", pages: 20, status: "Ready", views: 29 },
  { id: "RPT-011", title: "Warehouse Operations – Monthly Report June", category: "Monthly", dept: "Warehouse", type: "Summary", date: "2026-07-01", size: "1.6 MB", pages: 9, status: "Ready", views: 6 },
  { id: "RPT-012", title: "Backup Failure Analysis – June 2026", category: "Backup", dept: "IT Department", type: "Backup", date: "2026-07-04", size: "0.9 MB", pages: 5, status: "Draft", views: 2 },
];

const SCHED_REPORTS = [
  { id: "SCH-001", name: "Daily Backup Summary", frequency: "Daily", nextRun: "2026-07-04 06:00", recipients: "IT Team", status: "Active" },
  { id: "SCH-002", name: "Weekly PM Status Report", frequency: "Weekly", nextRun: "2026-07-07 08:00", recipients: "Plant Manager", status: "Active" },
  { id: "SCH-003", name: "Monthly Operations Summary", frequency: "Monthly", nextRun: "2026-08-01 09:00", recipients: "All HODs", status: "Active" },
  { id: "SCH-004", name: "QA Weekly Audit Summary", frequency: "Weekly", nextRun: "2026-07-07 10:00", recipients: "QA Team, COO", status: "Paused" },
  { id: "SCH-005", name: "Machine Health Daily Digest", frequency: "Daily", nextRun: "2026-07-04 07:00", recipients: "Maintenance Team", status: "Active" },
];

const RPT_MONTHLY = [
  { month: "Jan", reports: 18, views: 142 }, { month: "Feb", reports: 22, views: 168 },
  { month: "Mar", reports: 19, views: 155 }, { month: "Apr", reports: 24, views: 198 },
  { month: "May", reports: 21, views: 175 }, { month: "Jun", reports: 26, views: 210 },
  { month: "Jul", reports: 12, views: 95 },
];

type ReportsTab = "dashboard" | "executive" | "maintenance" | "qa" | "backup" | "machine" | "department" | "performance" | "monthly" | "yearly" | "builder" | "saved" | "scheduled";

function ReportCard({ report }: { report: typeof ALL_REPORTS[0] }) {
  const typeColors: Record<string, string> = {
    Summary: "bg-blue-50 text-blue-700 border-blue-200",
    Performance: "bg-purple-50 text-purple-700 border-purple-200",
    Maintenance: "bg-amber-50 text-amber-700 border-amber-200",
    QA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Backup: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Machine: "bg-cyan-50 text-cyan-700 border-cyan-200",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0"><FileText size={18} className="text-blue-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="text-xs font-bold text-slate-900 leading-snug">{report.title}</div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${report.status === "Ready" ? "bg-emerald-50 text-emerald-700" : report.status === "Draft" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>{report.status}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${typeColors[report.type] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{report.type}</span>
            <span className="text-[10px] text-slate-400">{report.dept}</span>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="text-[10px] text-slate-400">{report.date}</span>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="text-[10px] text-slate-400">{report.pages}p · {report.size}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 h-6 px-2 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"><Eye size={10} /> Preview</button>
            <button onClick={() => toast.success("Downloading PDF...")} className="flex items-center gap-1 h-6 px-2 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"><Download size={10} /> PDF</button>
            <button onClick={() => toast.success("Downloading Excel...")} className="flex items-center gap-1 h-6 px-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"><FileSpreadsheet size={10} /> Excel</button>
            <button className="flex items-center gap-1 h-6 px-2 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"><ExternalLink size={10} /> Share</button>
            <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1"><Eye size={9} /> {report.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportListSection({ title, reports }: { title: string; reports: typeof ALL_REPORTS }) {
  return (
    <div className="space-y-4">
      <SectionHeader title={title} subtitle={`${reports.length} reports available`}
        actions={<>
          <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"><Download size={13} /> Export All</button>
          <button onClick={() => toast.success("Report generated!")} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Plus size={13} /> Generate</button>
        </>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map(r => <ReportCard key={r.id} report={r} />)}
      </div>
    </div>
  );
}

function ReportsDashboardTab() {
  const totalReports = ALL_REPORTS.length;
  const ready = ALL_REPORTS.filter(r => r.status === "Ready").length;
  const scheduled = SCHED_REPORTS.filter(s => s.status === "Active").length;
  const totalViews = ALL_REPORTS.reduce((s, r) => s + r.views, 0);

  const catDist = ["Monthly","Performance","Maintenance","QA","Backup","Machine","Yearly","Executive"].map(c => ({
    name: c, value: ALL_REPORTS.filter(r => r.category === c).length,
  })).filter(d => d.value > 0);
  const PIE_COLORS = ["#2563EB","#7C3AED","#D97706","#10B981","#6366F1","#0891B2","#DC2626","#8B5CF6"];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", val: totalReports, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Ready to Download", val: ready, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Active Schedules", val: scheduled, icon: CalendarClock, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
          { label: "Total Views", val: totalViews, icon: Eye, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} border ${kpi.border}`}><kpi.icon size={15} className={kpi.color} /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Monthly Report Generation Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RPT_MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Bar dataKey="reports" name="Reports Generated" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="views" name="Total Views" fill="#DBEAFE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Reports by Category</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={catDist} cx="50%" cy="50%" outerRadius={60} innerRadius={28} dataKey="value" paddingAngle={3}>
                {catDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {catDist.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="text-slate-600">{d.name}</span></div>
                <span className="font-bold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock size={15} className="text-slate-400" /> Recent Reports</h3>
          <div className="space-y-2.5">
            {ALL_REPORTS.slice(0, 6).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0"><FileText size={13} className="text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{r.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{r.date} · {r.size} · {r.views} views</div>
                </div>
                <button onClick={() => toast.success("Downloading...")} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Download size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Repeat size={15} className="text-slate-400" /> Scheduled Reports</h3>
          <div className="space-y-2.5">
            {SCHED_REPORTS.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">{s.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.frequency} · Next: {s.nextRun}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomReportBuilderTab() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({ name: "", category: "Monthly", departments: [] as string[], dateFrom: "2026-06-01", dateTo: "2026-06-30", includeCharts: true, format: "PDF", schedule: "None" });

  const steps = ["Report Type", "Data Scope", "Visualization", "Delivery"];
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-1">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i + 1 < step ? "bg-blue-600 border-blue-600 text-white" : i + 1 === step ? "border-blue-600 text-blue-600 bg-blue-50" : "border-slate-200 text-slate-400 bg-white"}`}>
                  {i + 1 < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] font-semibold ${i + 1 === step ? "text-blue-600" : "text-slate-400"}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${i + 1 < step ? "bg-blue-600" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Step 1: Report Type & Name</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Report Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. July 2026 Monthly Operations Report" value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Report Category</label>
              <div className="grid grid-cols-3 gap-2">
                {["Monthly","Quarterly","Yearly","Maintenance","QA","Backup","Machine","Performance","Executive"].map(cat => (
                  <button key={cat} onClick={() => setConfig({ ...config, category: cat })}
                    className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all ${config.category === cat ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Step 2: Data Scope</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Date From</label>
                <input type="date" value={config.dateFrom} onChange={e => setConfig({ ...config, dateFrom: e.target.value })} className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Date To</label>
                <input type="date" value={config.dateTo} onChange={e => setConfig({ ...config, dateTo: e.target.value })} className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">Departments to Include</label>
              <div className="grid grid-cols-2 gap-2">
                {["All Departments", ...DEPARTMENTS].map(dept => (
                  <label key={dept} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" defaultChecked={dept === "All Departments"} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-medium text-slate-700">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Step 3: Visualization Options</h3>
            <div className="space-y-3">
              {[
                { label: "Include Charts & Graphs", key: "includeCharts", desc: "Bar charts, trend lines and pie charts" },
              ].map(opt => (
                <div key={opt.label} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                  <button onClick={() => setConfig({ ...config, includeCharts: !config.includeCharts })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${config.includeCharts ? "bg-blue-600" : "bg-slate-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.includeCharts ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Output Format</label>
                <div className="flex gap-2">
                  {["PDF", "Excel", "CSV", "Word"].map(f => (
                    <button key={f} onClick={() => setConfig({ ...config, format: f })}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${config.format === f ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Step 4: Delivery & Schedule</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Send To (email)</label>
              <input type="email" placeholder="e.g. coo@rajaram.com, plant.manager@rajaram.com" className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Auto-Schedule</label>
              <select value={config.schedule} onChange={e => setConfig({ ...config, schedule: e.target.value })} className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700">
                {["None", "Daily", "Weekly", "Monthly", "Quarterly"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-700 mb-3">Report Summary</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[["Name", config.name || "Not set"], ["Category", config.category], ["Date Range", `${config.dateFrom} to ${config.dateTo}`], ["Format", config.format], ["Charts", config.includeCharts ? "Yes" : "No"], ["Schedule", config.schedule]].map(([k, v]) => (
                  <div key={k}><span className="text-slate-400">{k}: </span><span className="font-semibold text-slate-900">{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">
          <ChevronLeft size={14} /> Previous
        </button>
        {step < 4 ? (
          <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={() => { toast.success("Report generated and queued for delivery!"); setStep(1); }} className="flex items-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
            <PlayCircle size={14} /> Generate Report
          </button>
        )}
      </div>
    </div>
  );
}

function ScheduledReportsTab() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Scheduled Reports" subtitle="Auto-generated and delivered on schedule"
        actions={<button onClick={() => toast.success("Schedule added!")} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Plus size={13} /> Add Schedule</button>} />
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-5 py-3">Report Name</th><th className="px-4 py-3">Frequency</th><th className="px-4 py-3">Next Run</th><th className="px-4 py-3">Recipients</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {SCHED_REPORTS.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0"><Repeat size={12} className="text-blue-600" /></div>
                    <div className="text-xs font-bold text-slate-900">{s.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-600">{s.frequency}</td>
                <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">{s.nextRun}</td>
                <td className="px-4 py-3.5 text-xs text-slate-600">{s.recipients}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toast.success("Schedule updated!")} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={13} /></button>
                    <button onClick={() => toast.error("Schedule deleted.")} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportsTab>("dashboard");
  const TABS: { id: ReportsTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" }, { id: "executive", label: "Executive" },
    { id: "maintenance", label: "Maintenance" }, { id: "qa", label: "QA" },
    { id: "backup", label: "Backup" }, { id: "machine", label: "Machine" },
    { id: "department", label: "Department" }, { id: "performance", label: "Performance" },
    { id: "monthly", label: "Monthly" }, { id: "yearly", label: "Yearly" },
    { id: "builder", label: "Custom Builder" }, { id: "saved", label: "Saved" }, { id: "scheduled", label: "Scheduled" },
  ];
  const filterMap: Record<string, string> = { executive: "Executive", maintenance: "Maintenance", qa: "QA", backup: "Backup", machine: "Machine", department: "Monthly", performance: "Performance", monthly: "Monthly", yearly: "Yearly", saved: "" };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} /><span>Dashboard</span><ChevronRight size={12} /><span className="text-slate-700 font-semibold">Reports</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200"><BarChart2 size={20} className="text-white" /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports Center</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Enterprise reporting · {ALL_REPORTS.length} reports available</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"><Download size={13} /> Export All</button>
            <button onClick={() => setActiveTab("builder")} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Plus size={14} /> New Report</button>
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5 overflow-hidden">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${activeTab === tab.id ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>{tab.label}</button>
          ))}
        </div>
      </div>
      <div className="animate-in fade-in duration-200">
        {activeTab === "dashboard" && <ReportsDashboardTab />}
        {activeTab === "builder" && <CustomReportBuilderTab />}
        {activeTab === "scheduled" && <ScheduledReportsTab />}
        {!["dashboard","builder","scheduled"].includes(activeTab) && (
          <ReportListSection
            title={TABS.find(t => t.id === activeTab)?.label + " Reports"}
            reports={ALL_REPORTS.filter(r => activeTab === "saved" || r.category === filterMap[activeTab] || (activeTab === "department" && (r.dept !== "All Departments" && r.category === "Monthly")))}
          />
        )}
      </div>
    </div>
  );
}
