import { Bell } from "lucide-react";

interface EmptyNotificationsProps {
  title?: string;
  subtitle?: string;
}

export function EmptyNotifications({
  title = "No notifications available.",
  subtitle = "All clear in this category.",
}: EmptyNotificationsProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
      <Bell size={32} className="text-slate-200 mx-auto mb-3" />
      <div className="text-sm font-bold text-slate-700 mb-1">{title}</div>
      <div className="text-xs text-slate-400">{subtitle}</div>
    </div>
  );
}
