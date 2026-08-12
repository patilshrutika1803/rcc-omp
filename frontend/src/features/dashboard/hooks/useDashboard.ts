// ─────────────────────────────────────────────────────────────────────────────
// useDashboard
// Single hook that loads all dashboard data via dashboardService.
// DashboardPage should never fetch or hardcode data directly - only call this.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  getDashboardStats,
  getWeeklyOverview,
  getTaskDistribution,
  getRecentActivity,
  getUpcomingDeadlines,
  getCalendarEvents,
  getWorkQueue,
  getNotes,
} from "../services/dashboardService";
import { GENERAL_SETTINGS_EVENT, loadGeneralSettings } from "../../settings/utils/generalSettings";
import type {
  DashboardStats,
  WeeklyOverviewPoint,
  TaskDistributionSlice,
  RecentActivityItem,
  UpcomingDeadline,
  CalendarEvent,
  WorkQueueTask,
  PersonalNotes,
} from "../types/dashboard";

interface UseDashboardResult {
  stats: DashboardStats | null;
  weeklyOverview: WeeklyOverviewPoint[];
  distribution: TaskDistributionSlice[];
  workQueue: WorkQueueTask[];
  calendarEvents: CalendarEvent[];
  activities: RecentActivityItem[];
  notes: PersonalNotes | null;
  upcomingDeadlines: UpcomingDeadline[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyOverview, setWeeklyOverview] = useState<WeeklyOverviewPoint[]>([]);
  const [distribution, setDistribution] = useState<TaskDistributionSlice[]>([]);
  const [workQueue, setWorkQueue] = useState<WorkQueueTask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [notes, setNotes] = useState<PersonalNotes | null>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(() => loadGeneralSettings().autoRefresh);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    const syncAutoRefresh = () => {
      setAutoRefreshEnabled(loadGeneralSettings().autoRefresh);
    };

    window.addEventListener(GENERAL_SETTINGS_EVENT, syncAutoRefresh);
    return () => window.removeEventListener(GENERAL_SETTINGS_EVENT, syncAutoRefresh);
  }, []);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = window.setInterval(() => {
      setReloadToken((t) => t + 1);
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [autoRefreshEnabled]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [
          statsRes,
          weeklyRes,
          distributionRes,
          activityRes,
          deadlinesRes,
          calendarRes,
          workQueueRes,
          notesRes,
        ] = await Promise.all([
          getDashboardStats(),
          getWeeklyOverview(),
          getTaskDistribution(),
          getRecentActivity(),
          getUpcomingDeadlines(),
          getCalendarEvents(),
          getWorkQueue(),
          getNotes(),
        ]);

        if (cancelled) return;

        setStats(statsRes);
        setWeeklyOverview(weeklyRes);
        setDistribution(distributionRes);
        setActivities(activityRes);
        setUpcomingDeadlines(deadlinesRes);
        setCalendarEvents(calendarRes);
        setWorkQueue(workQueueRes);
        setNotes(notesRes);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return {
    stats,
    weeklyOverview,
    distribution,
    workQueue,
    calendarEvents,
    activities,
    notes,
    upcomingDeadlines,
    isLoading,
    error,
    refetch,
  };
}
