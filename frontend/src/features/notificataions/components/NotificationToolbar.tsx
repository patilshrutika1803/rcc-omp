import { Bell, ChevronRight, CheckCircle2, LayoutDashboard, SlidersHorizontal } from "lucide-react";

interface NotificationToolbarProps {
  unreadCount: number;
  totalCount: number;
  onMarkAllRead: () => void;
}

export function NotificationToolbar({ unreadCount, totalCount, onMarkAllRead }: NotificationToolbarProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
        <LayoutDashboard size={12} />
        <span>Dashboard</span>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-semibold">Notifications</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200 relative">
            <Bell size={20} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {unreadCount} unread · {totalCount} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <CheckCircle2 size={13} /> Mark All Read
          </button>
          <button className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <SlidersHorizontal size={13} /> Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
