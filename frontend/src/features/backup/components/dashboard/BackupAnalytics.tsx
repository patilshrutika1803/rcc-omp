import React from "react";
import { SuccessRateChart } from "./SuccessRateChart";
import { StorageTrendChart } from "./StorageTrendChart";
import { BackupTypeChart } from "./BackupTypeChart";
import { FailedJobsTable } from "./FailedJobsTable";
import type { BackupJob } from "../../types/backup";
import { BKP_STORAGE_TREND } from "../../constants/backupConstants";

export function BackupAnalytics({ jobs }: { jobs: BackupJob[] }) {
  return (
    <div className="space-y-5">
      <SuccessRateChart weeklyTrend={[]} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <StorageTrendChart storageTrend={BKP_STORAGE_TREND} />
        <BackupTypeChart jobs={jobs} />
      </div>
      <FailedJobsTable jobs={jobs} />
    </div>
  );
}
