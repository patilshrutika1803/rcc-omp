import React from "react";
import { SuccessRateChart } from "./SuccessRateChart";
import { StorageTrendChart } from "./StorageTrendChart";
import { BackupTypeChart } from "./BackupTypeChart";
import { FailedJobsTable } from "./FailedJobsTable";

export function BackupAnalytics() {
  return (
    <div className="space-y-5">
      {/* Top row: Success Rate + Storage Trend */}
      <SuccessRateChart />

      {/* Bottom row: Storage Trend + Daily Jobs Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <StorageTrendChart />
        <BackupTypeChart />
      </div>

      {/* Failed jobs detail */}
      <FailedJobsTable />
    </div>
  );
}
