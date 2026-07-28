import type { QAActivity } from "../types/qa";
import { formatDate } from "../../../shared/utils/dateHelpers";

interface QACalendarViewProps {
  activities: QAActivity[];
  onSelect: (activity: QAActivity) => void;
}

export function QACalendarView({ activities, onSelect }: QACalendarViewProps) {
  if (activities.length === 0) {
    return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No QA activities scheduled yet.</div>;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {activities.map((activity) => (
          <button key={activity.id} onClick={() => onSelect(activity)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40">
            <div className="text-xs font-semibold text-slate-500">{activity.qmsNumber}</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{activity.qmsType}</div>
            <div className="mt-2 text-xs text-slate-600">Due: {formatDate(activity.dueDate || activity.targetDate)}</div>
            <div className="mt-1 text-xs text-slate-500">Dept: {activity.department}</div>
            <div className="mt-1 text-xs font-semibold text-blue-600">{activity.status}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
