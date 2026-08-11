// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage
// Assembles dashboard components only. All data comes from useDashboard().
// No hardcoded/demo data lives in this file - see services/dashboardService.ts.
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthProvider";
import * as noteService from "../notes/services/noteService";

import DashboardHeader from "./components/DashboardHeader";
import DashboardKPICards from "./components/DashboardKPICards";
import WeeklyOverviewChart from "./components/WeeklyOverviewChart";
import TaskDistributionChart from "./components/TaskDistributionChart";
import MachineHealthAndProgress from "./components/MachineHealthAndProgress";
import WorkQueueTable from "./components/WorkQueueTable";
import CalendarCard from "./components/CalendarCard";
import UpcomingDeadlinesCard from "./components/UpcomingDeadlinesCard";
import RecentActivityCard from "./components/RecentActivityCard";
import PersonalNotesCard from "./components/PersonalNotesCard";

import { useDashboard } from "./hooks/useDashboard";
import { KPI_VISUAL_CONFIG } from "./constants/dashboardConfig";

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

  const navigate = useNavigate();
  const { user } = useAuth();
  const greetingName = user?.name?.split(" ")?.[0] ?? "Team";
  const dateTimeText = `${weekday}, ${day} ${month} ${year} · ${timeIST} IST`;

  const {
    stats,
    weeklyOverview,
    distribution,
    workQueue,
    calendarEvents,
    activities,
    notes,
    upcomingDeadlines,
  } = useDashboard();

  async function handleDashboardAddNote() {
    await noteService.createNote({
      title: "Untitled",
      content: "",
      folder: "My Notes",
      tags: [],
      pinned: false,
      shared: false,
    });
    navigate("/notes");
  }

  // Map service-provided KPI label/value pairs onto their icon/color visual config.
  const kpisWithVisuals = useMemo(() => {
    const kpis = stats?.kpis ?? [];
    return kpis.map((kpi) => ({
      ...kpi,
      ...KPI_VISUAL_CONFIG[kpi.label],
    }));
  }, [stats]);

  const distributionTotal = useMemo(
    () => distribution.reduce((sum, d) => sum + d.value, 0),
    [distribution]
  );

  // Calendar display values derived from the live clock (not sample data).
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const todayDate = Number(now.toLocaleDateString("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" }));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const leadingDays: number[] = [];

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
<DashboardHeader greetingName={greetingName} dateTimeText={dateTimeText} onAddNote={handleDashboardAddNote} />

      <DashboardKPICards kpis={kpisWithVisuals} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WeeklyOverviewChart data={weeklyOverview} />
            <TaskDistributionChart data={distribution} total={distributionTotal} />
          </div>

          <MachineHealthAndProgress
            machineHealth={stats?.machineHealth ?? { healthy: 0, warning: 0, critical: 0, alertTitle: "", alertDesc: "" }}
            departmentProgress={stats?.departmentProgress ?? []}
          />

          <WorkQueueTable tasks={workQueue} />
        </div>

        <div className="space-y-6 flex flex-col">
          <CalendarCard
            monthLabel={monthLabel}
            today={todayDate}
            daysInMonth={daysInMonth}
            leadingDays={leadingDays}
            events={calendarEvents}
          />

          <UpcomingDeadlinesCard deadlines={upcomingDeadlines} />

          <RecentActivityCard activities={activities} />

          <PersonalNotesCard content={notes?.content ?? ""} />
        </div>
      </div>
    </div>
  );
}
