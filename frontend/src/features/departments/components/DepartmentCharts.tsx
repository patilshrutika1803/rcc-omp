// ─────────────────────────────────────────────────────────────────────────────
// DepartmentCharts
// Extracted from DeptDashboardTab and DeptAnalyticsTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged — same recharts configuration.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type {
  DepartmentAnalyticsMonthly,
  DepartmentMonthlyPerf,
  DepartmentTaskDistribution,
} from "../types/department";
import { PERFORMANCE_TREND_LEGEND, TASK_DIST_LEGEND } from "../constants/departmentConfig";

/** "Department Performance Overview" area chart (Dashboard tab) */
export function PerformanceOverviewChart({ data }: { data: DepartmentMonthlyPerf[] }) {
  return (
    <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Department Performance Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly performance score trend · 2026</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
          {PERFORMANCE_TREND_LEGEND.map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: c }} />
              {l}
            </span>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <div className="h-[210px] flex items-center justify-center text-xs text-slate-400">
          No performance data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[60, 100]} />
            <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
            <Area type="monotone" dataKey="production" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="it" stroke="#7C3AED" fill="#F5F3FF" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="warehouse" stroke="#D97706" fill="#FFFBEB" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="utilities" stroke="#EF4444" fill="#FEF2F2" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="qa" stroke="#10B981" fill="#ECFDF5" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/** "Task Distribution by Department" bar chart (Dashboard tab) */
export function TaskDistributionChart({ data }: { data: DepartmentTaskDistribution[] }) {
  return (
    <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Task Distribution by Department</h3>
      {data.length === 0 ? (
        <div className="h-[210px] flex items-center justify-center text-xs text-slate-400">
          No task data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <Bar dataKey="pm" name="Open PM" fill="#2563EB" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="qa" name="Open QA" fill="#7C3AED" radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="backup" name="Backup Jobs" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500 justify-center">
        {TASK_DIST_LEGEND.map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-sm ${c}`} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/** "Monthly Productivity Trend" area chart (Analytics tab) */
export function ProductivityTrendChart({ data }: { data: DepartmentAnalyticsMonthly[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900">Monthly Productivity Trend</h3>
        <p className="text-xs text-slate-400 mt-0.5">Key operational metrics · 2026 YTD</p>
      </div>
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[60, 100]} />
            <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <Area type="monotone" dataKey="taskCompletion" name="Task Completion" stroke="#2563EB" fill="#EFF6FF" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="qaPass" name="QA Pass Rate" stroke="#10B981" fill="#ECFDF5" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="backupSuccess" name="Backup Success" stroke="#7C3AED" fill="#F5F3FF" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/** "Department Performance Comparison" horizontal bar chart (Analytics tab) */
export function PerformanceComparisonChart({ data }: { data: { name: string; score: number; employees: number }[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900">Department Performance Comparison</h3>
        <p className="text-xs text-slate-400 mt-0.5">Current month performance score</p>
      </div>
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={70} />
            <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <Bar dataKey="score" name="Performance Score" fill="#2563EB" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/** "Machine Utilization Trend" area chart (Analytics tab) */
export function MachineUtilizationChart({ data }: { data: DepartmentAnalyticsMonthly[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900">Machine Utilization Trend</h3>
        <p className="text-xs text-slate-400 mt-0.5">Average % across all departments</p>
      </div>
      {data.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-xs text-slate-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[60, 85]} />
            <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <Area type="monotone" dataKey="machineUtil" name="Utilization %" stroke="#F59E0B" fill="#FFFBEB" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/** "Resource Utilization Summary" stacked bar chart (Resource Allocation tab) */
export function ResourceUtilizationChart({ data }: { data: { name: string; utilized: number; free: number }[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Resource Utilization Summary</h3>
      {data.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-xs text-slate-400">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <RechartsTooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <Bar dataKey="utilized" name="Utilized %" fill="#2563EB" stackId="a" radius={[0, 0, 4, 4]} />
            <Bar dataKey="free" name="Free Capacity %" fill="#E2E8F0" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
