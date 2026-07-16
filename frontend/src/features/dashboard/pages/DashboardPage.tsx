// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Archive,
  CheckSquare,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle2,
  Upload,
  Activity,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  Filter,
  Battery,
  Database,
  Type,
  Sun
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";


const WEEKLY_DATA = [
  { name: "Mon", completed: 12, added: 15 },
  { name: "Tue", completed: 19, added: 14 },
  { name: "Wed", completed: 15, added: 18 },
  { name: "Thu", completed: 22, added: 16 },
  { name: "Fri", completed: 28, added: 20 },
  { name: "Sat", completed: 8, added: 5 },
  { name: "Sun", completed: 10, added: 6 },
];

const DISTRIBUTION_DATA = [
  { name: "PM Tasks", value: 45, color: "#2563EB" },
  { name: "Backups", value: 30, color: "#16A34A" },
  { name: "QA Scans", value: 25, color: "#7C3AED" },
];

export default function DashboardPage() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);


  const weekday = now.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });
  const day = now.toLocaleDateString("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" });
  const month = now.toLocaleDateString("en-IN", { month: "long", timeZone: "Asia/Kolkata" });
  const year = now.toLocaleDateString("en-IN", { year: "numeric", timeZone: "Asia/Kolkata" });

  const timeIST = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const dateTimeText = `${weekday}, ${day} ${month} ${year} · ${timeIST} IST`;

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good morning, Arun</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{dateTimeText}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-all">
            <Archive size={14} className="text-slate-400" /> Add Backup
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-all">
            <Wrench size={14} className="text-slate-400" /> Add PM
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-all">
            <CheckSquare size={14} className="text-slate-400" /> Add QA
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-sm transition-all">
            <FileText size={14} className="text-slate-400" /> Add Note
          </button>
          <div className="w-px h-5 bg-slate-300 mx-1 hidden sm:block" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-all">
Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Today's Backups", val: "14", icon: Archive, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Today's PM", val: "8", icon: Wrench, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Today's QA", val: "5", icon: CheckSquare, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
          { label: "Pending Tasks", val: "22", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Completed Today", val: "16", icon: CheckCircle2, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
          { label: "Overdue Tasks", val: "2", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${kpi.bg} ${kpi.border} border`}>
                <kpi.icon size={14} className={kpi.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{kpi.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Weekly Tasks Overview</h3>
                <select className="text-xs border border-slate-200 rounded p-1 text-slate-600 bg-slate-50 outline-none">
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WEEKLY_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashGradCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                    <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} labelStyle={{ fontWeight: "bold", color: "#0F172A", marginBottom: "4px" }} />
                    <Area type="monotone" dataKey="completed" name="Completed Tasks" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#dashGradCompleted)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Task Distribution</h3>
              <div className="h-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DISTRIBUTION_DATA} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value">
                      {DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`dash-dist-cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip cursor={false} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-900">100</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {DISTRIBUTION_DATA.map(d => (
                  <div key={d.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-slate-900">Machine Health Summary</h3>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1 border-r border-slate-100">
                  <div className="text-2xl font-bold text-emerald-600">284</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1"><CheckCircle2 size={12} /> Healthy</div>
                </div>
                <div className="text-center flex-1 border-r border-slate-100">
                  <div className="text-2xl font-bold text-amber-500">12</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1"><AlertTriangle size={12} /> Warning</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1"><XCircle size={12} /> Critical</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">SRV-PROD-042 requires attention</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">High CPU utilization detected over the last 4 hours.</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-5">Department Progress</h3>
              <div className="space-y-4">
                {[
                  { name: "Preventive Maintenance", pct: 78, color: "bg-blue-600" },
                  { name: "Backup Activities", pct: 92, color: "bg-emerald-500" },
                  { name: "QA Activities", pct: 45, color: "bg-purple-500" },
                ].map(dept => (
                  <div key={dept.name}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-semibold text-slate-700">{dept.name}</span>
                      <span className="text-xs font-bold text-slate-900">{dept.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${dept.color}`} style={{ width: `${dept.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Today's Work Queue</h3>
              <div className="flex gap-2">
                <button className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded hover:bg-slate-100">Filter</button>
                <button className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded hover:bg-slate-100">View All</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Task ID</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { id: "TK-2041", desc: "Full Database Backup - ERP", type: "Backup", prio: "P1 Critical", status: "In Progress", sColor: "text-blue-600 bg-blue-50" },
                    { id: "TK-2042", desc: "Quarterly Switch Audit", type: "PM", prio: "P2 High", status: "Pending", sColor: "text-amber-600 bg-amber-50" },
                    { id: "TK-2043", desc: "Firewall Rule Validation", type: "QA", prio: "P2 High", status: "Pending", sColor: "text-amber-600 bg-amber-50" },
                    { id: "TK-2038", desc: "Daily Log Rotation", type: "Backup", prio: "P3 Medium", status: "Completed", sColor: "text-emerald-600 bg-emerald-50" },
                    { id: "TK-2039", desc: "UPS Battery Test (Room A)", type: "PM", prio: "P2 High", status: "Overdue", sColor: "text-red-600 bg-red-50" },
                  ].map((task, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">{task.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{task.desc}</td>
                      <td className="px-5 py-3 text-xs">{task.type}</td>
                      <td className="px-5 py-3 text-xs">
                        <span className={task.prio.includes("P1") ? "text-red-600 font-semibold" : task.prio.includes("P2") ? "text-amber-600 font-semibold" : ""}>
                          {task.prio}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${task.sColor}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900">July 2026</h3>
              <div className="flex gap-1">
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"><ChevronLeft size={16} /></button>
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-slate-400">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <div key="cal-prev-29" className="p-1.5 text-slate-300">29</div>
              <div key="cal-prev-30" className="p-1.5 text-slate-300">30</div>
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isToday = day === 3;
                const hasTask = [3, 5, 7, 10, 12, 15, 20].includes(day);
                const isOverdue = [5].includes(day);
                return (
                  <div key={day} className={`p-1.5 rounded-md relative cursor-pointer ${isToday ? "bg-blue-600 text-white font-bold" : "text-slate-700 hover:bg-slate-100"} ${hasTask && !isToday ? "font-semibold" : ""}`}>
                    {day}
                    {hasTask && !isToday && (
                      <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isOverdue ? "bg-red-500" : "bg-blue-500"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" /> Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              {[
                { time: "Today, 2:00 PM", task: "Patch Deployment DC-01", type: "PM" },
                { time: "Today, 5:30 PM", task: "End-of-day Backup Verif.", type: "Backup" },
                { time: "Tomorrow", task: "SSL Certificate Renewal", type: "Security" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-start pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.task}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.time}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">{item.type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Activity size={16} className="text-slate-400" /> Recent Activity
            </h3>
            <div className="relative border-l-2 border-slate-100 ml-2 space-y-5">
              {[
                { time: "10 mins ago", title: "Backup completed", desc: "ERP Database full backup successful.", color: "text-emerald-500" },
                { time: "45 mins ago", title: "Note added", desc: "Arun added note to TK-2041.", color: "text-blue-500" },
                { time: "2 hours ago", title: "Alert resolved", desc: "High memory usage on SRV-012 cleared.", color: "text-emerald-500" },
                { time: "3 hours ago", title: "Task assigned", desc: "Quarterly Audit assigned to Priya.", color: "text-slate-500" },
              ].map((log, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${log.color}`} />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{log.time}</div>
                  <div className="text-xs font-bold text-slate-800">{log.title}</div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{log.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl shadow-sm p-5 relative">
            <div className="absolute top-0 left-4 right-4 h-1 bg-amber-200 rounded-b-md" />
            <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-amber-500" /> Personal Notes
            </h3>
            <textarea
              className="w-full h-24 bg-transparent border-none text-xs text-amber-900 focus:outline-none focus:ring-0 resize-none placeholder-amber-700/50 leading-relaxed"
              placeholder="Jot down quick reminders..."
              defaultValue="- Review new firewall policies before EOD.&#10;- Follow up with ISP vendor regarding latency.&#10;- Prep Q3 maintenance schedule."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
