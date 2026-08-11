// ─────────────────────────────────────────────────────────────────────────────
// NotificationsPage
//
// Thin presentational shell. All state/logic lives in useNotifications();
// all data comes from notificationService (no sample/mock data here).
// UI, Tailwind classes, spacing, colors, and behavior are unchanged from the
// original monolithic implementation.
// ─────────────────────────────────────────────────────────────────────────────

import { useNotifications } from "./hooks/useNotifications";
import { NotificationToolbar } from "./components/NotificationToolbar";
import { NotificationSidebar } from "./components/NotificationSidebar";
import { NotificationSearch } from "./components/NotificationSearch";
import { NotificationCard } from "./components/NotificationCard";
import { EmptyNotifications } from "./components/EmptyNotifications";

export default function NotificationsPage() {
  const {
    displayed,
    filters,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    unreadCount,
    totalCount,
    markRead,
    markAllRead,
    deleteNotif,
    archiveNotif,
    handlePMNotificationClick,
    handleBackupNotificationClick,
    handleQANotificationClick,
    handleNotificationClick,
  } = useNotifications();

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <NotificationToolbar unreadCount={unreadCount} totalCount={totalCount} onMarkAllRead={markAllRead} />

      <div className="flex gap-5">
        <NotificationSidebar filters={filters} activeFilter={activeFilter} onSelect={setActiveFilter} />

        <div className="flex-1 min-w-0 space-y-3">
          <NotificationSearch value={search} onChange={setSearch} />

          {displayed.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="space-y-2.5">
              {displayed.map((n) => (
                <NotificationCard
                  key={n.id}
                  n={n}
                  onRead={() => markRead(n.id)}
                  onDelete={() => deleteNotif(n.id)}
                  onArchive={() => archiveNotif(n.id)}
                  onPmClick={handlePMNotificationClick}
                  onBackupClick={handleBackupNotificationClick}
                  onQaClick={handleQANotificationClick}
                  onNotificationClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
