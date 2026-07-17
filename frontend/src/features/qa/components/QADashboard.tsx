import type { QADepartmentBreakdownPoint, QATrendPoint } from "../types/qa";
import { KPISection } from "./KPISection";
import { TrendChart } from "./TrendChart";
import { DepartmentCompletionChart } from "./DepartmentCompletionChart";

interface QADashboardProps {
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
  upcomingCount: number;
  trendData: QATrendPoint[];
  departmentBreakdown: QADepartmentBreakdownPoint[];
}

export function QADashboard({
  totalCount,
  pendingCount,
  completedCount,
  overdueCount,
  upcomingCount,
  trendData,
  departmentBreakdown,
}: QADashboardProps) {
  return (
    <div className="space-y-6">
      <KPISection
        totalCount={totalCount}
        pendingCount={pendingCount}
        completedCount={completedCount}
        overdueCount={overdueCount}
        upcomingCount={upcomingCount}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <TrendChart trendData={trendData} />
        <DepartmentCompletionChart departmentBreakdown={departmentBreakdown} />
      </div>
    </div>
  );
}
