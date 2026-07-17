import { Archive, Trash2 } from "lucide-react";
import type { Notification } from "../types/notification";
import { getSeverityBadgeClasses, getSeverityBorderColor } from "../utils/notificationHelpers";
import { NotificationIcon } from "./NotificationIcon";

interface NotificationCardProps {
  n: Notification;
  onRead: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

export function NotificationCard({ n, onRead, onDelete, onArchive }: NotificationCardProps) {
  const borderColor = getSeverityBorderColor(n.severity);
  const badgeClasses = getSeverityBadgeClasses(n.severity);

  return (
    <div
      className={`bg-white border border-slate-200 border-l-4 ${borderColor} rounded-xl shadow-sm p-4 hover:shadow-md transition-all ${
        !n.read ? "bg-blue-50/20" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon severity={n.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className={`text-xs font-bold ${!n.read ? "text-slate-900" : "text-slate-700"}`}>{n.title}</div>
            <div className="flex items-center gap-1 shrink-0">
              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              <span className="text-[10px] text-slate-400">{n.time}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-2">{n.message}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${badgeClasses}`}>
              {n.severity}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">{n.category}</span>
            <div className="ml-auto flex items-center gap-1">
              {!n.read && (
                <button onClick={onRead} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Mark read
                </button>
              )}
              <button onClick={onArchive} className="p-1 text-slate-300 hover:text-slate-500 rounded transition-colors">
                <Archive size={12} />
              </button>
              <button onClick={onDelete} className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
