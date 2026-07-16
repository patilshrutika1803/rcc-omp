// ─────────────────────────────────────────────────────────────────────────────
// DepartmentActivities
// Extracted from DeptDashboardTab (Recent Activities + Upcoming Reviews) and
// DeptDetailsTab (Recent Activities section) in the monolithic
// DepartmentsPage.tsx. UI/behavior unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Activity, CalendarClock, User } from "lucide-react";
import { daysUntil } from "../../../shared/utils/dateHelpers";
import type { DepartmentActivity, DepartmentReview } from "../types/department";

export interface RecentActivitiesProps {
  activities: (DepartmentActivity & { dept?: string })[];
  title?: string;
}

/** Timeline of recent department activities (used in Dashboard + Details) */
export function RecentActivities({ activities, title = "Recent Department Activities" }: RecentActivitiesProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Activity size={15} className="text-blue-500" /> {title}
      </h3>
      {activities.length === 0 ? (
        <div className="text-xs text-slate-400 text-center py-8">No recent activities</div>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-2 space-y-4">
          {activities.map((a, i) => (
            <div key={i} className="relative pl-5">
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {a.time}
                {a.dept ? ` · ${a.dept}` : ""}
              </div>
              <div className="text-xs font-semibold text-slate-800 leading-snug">{a.action}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <User size={9} />
                {a.by}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface UpcomingReviewsProps {
  reviews: DepartmentReview[];
}

/** Upcoming Reviews card (Dashboard tab) */
export function UpcomingReviews({ reviews }: UpcomingReviewsProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <CalendarClock size={15} className="text-purple-500" /> Upcoming Reviews
      </h3>
      {reviews.length === 0 ? (
        <div className="text-xs text-slate-400 text-center py-8">No upcoming reviews</div>
      ) : (
        <div className="space-y-2.5">
          {reviews.map((r, i) => {
            const days = daysUntil(r.date);
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center bg-white border border-slate-200 shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    {new Date(r.date).toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                  <span className="text-sm font-bold text-slate-700 leading-none">{new Date(r.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{r.type}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {r.dept} · {r.reviewer}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    days <= 3 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {days}d
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
