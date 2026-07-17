import { KPI_CARD_CONFIG } from "../constants/qaConstants";
import { KPICard } from "./KPICard";

interface KPISectionProps {
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
  upcomingCount: number;
}

export function KPISection({ totalCount, pendingCount, completedCount, overdueCount, upcomingCount }: KPISectionProps) {
  const values: Record<string, number> = { totalCount, pendingCount, completedCount, overdueCount, upcomingCount };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {KPI_CARD_CONFIG.map((kpi, i) => (
        <KPICard key={i} label={kpi.label} value={values[kpi.key]} icon={kpi.icon} color={kpi.color} bg={kpi.bg} />
      ))}
    </div>
  );
}
