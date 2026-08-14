// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage
// Assembles dashboard components only. All data comes from useDashboard().
// No hardcoded/demo data lives in this file - see services/dashboardService.ts.
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/AuthProvider";
import * as noteService from "../notes/services/noteService";

import DashboardHeader from "./components/DashboardHeader";
import WorkQueueTable from "./components/WorkQueueTable";
import CalendarCard from "./components/CalendarCard";
import UpcomingDeadlinesCard from "./components/UpcomingDeadlinesCard";
import PersonalNotesCard from "./components/PersonalNotesCard";

import { useDashboard } from "./hooks/useDashboard";

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
  const hour = now.getHours();
  const greetingText = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateTimeText = `${weekday}, ${day} ${month} ${year} · ${timeIST} IST`;

  const { workQueue, calendarEvents, notes, upcomingDeadlines } = useDashboard();

  function handleAddBackup() {
    window.sessionStorage.setItem("rcc_omp_backup_open_add", "1");
    navigate("/backup-activities");
  }

  function handleAddPM() {
    window.sessionStorage.setItem("rcc_omp_pm_open_add", "1");
    navigate("/preventive-maintenance");
  }

  function handleAddQA() {
    window.sessionStorage.setItem("rcc_omp_qa_open_add", "1");
    navigate("/qa-activities");
  }

  async function handleDashboardAddNote() {
    const created = await noteService.createNote({
      title: "Untitled",
      content: "",
      folder: "My Notes",
      tags: [],
      pinned: false,
      shared: false,
    });

    if (created) {
      navigate("/notes");
      return;
    }

    navigate("/notes");
  }

  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const todayDate = Number(now.toLocaleDateString("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" }));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const leadingDays: number[] = [];

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <DashboardHeader
        greetingName={greetingName}
        greetingText={greetingText}
        dateTimeText={dateTimeText}
        onAddBackup={handleAddBackup}
        onAddPM={handleAddPM}
        onAddQA={handleAddQA}
        onAddNote={handleDashboardAddNote}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
        <div className="space-y-6 flex flex-col">
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

          {upcomingDeadlines.length > 0 && <UpcomingDeadlinesCard deadlines={upcomingDeadlines} />}

          <PersonalNotesCard content={notes?.content ?? ""} />
        </div>
      </div>
    </div>
  );
}
