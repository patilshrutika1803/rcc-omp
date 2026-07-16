// ─────────────────────────────────────────────────────────────────────────────
// DepartmentDashboard
// Extracted from the original DeptDashboardTab in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged.
//
// NOTE: In the original file this tab was defined but not wired into the
// exported DepartmentsPage (only Directory and Calendar tabs were rendered).
// It is preserved here, unused-but-available, to avoid removing any feature.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Layers } from "lucide-react";
import type {
  Department,
  DepartmentDashboardStats,
  DepartmentMonthlyPerf,
  DepartmentTaskDistribution,
  DepartmentReview,
  DepartmentActivity,
} from "../types/department";
import { DashboardKPICards } from "./DepartmentKPICards";
import { PerformanceOverviewChart, TaskDistributionChart } from "./DepartmentCharts";
import { RecentActivities, UpcomingReviews } from "./DepartmentActivities";
import DepartmentCard from "./DepartmentCard";

export interface DepartmentDashboardProps {
  stats: DepartmentDashboardStats;
  monthlyPerformance: DepartmentMonthlyPerf[];
  taskDistribution: DepartmentTaskDistribution[];
  recentActivities: (DepartmentActivity & { dept?: string })[];
  upcomingReviews: DepartmentReview[];
  departments: Department[];
  onViewDetails: (d: Department) => void;
}

export default function DepartmentDashboard({
  stats,
  monthlyPerformance,
  taskDistribution,
  recentActivities,
  upcomingReviews,
  departments,
  onViewDetails,
}: DepartmentDashboardProps) {
  return (
    <div className="space-y-5">
      <DashboardKPICards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <PerformanceOverviewChart data={monthlyPerformance} />
        <TaskDistributionChart data={taskDistribution} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <RecentActivities activities={recentActivities} />
        <UpcomingReviews reviews={upcomingReviews} />

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers size={15} className="text-slate-400" /> Department Performance
          </h3>
          {departments.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-8">No departments available</div>
          ) : (
            <div className="space-y-3">
              {departments.map((d, i) => (
                <DepartmentCard key={i} department={d} onClick={onViewDetails} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
