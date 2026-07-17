import type { NotificationFilter, NotificationFilterId } from "../types/notification";

interface NotificationSidebarProps {
  filters: NotificationFilter[];
  activeFilter: NotificationFilterId;
  onSelect: (id: NotificationFilterId) => void;
}

export function NotificationSidebar({ filters, activeFilter, onSelect }: NotificationSidebarProps) {
  return (
    <div className="w-52 shrink-0">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Categories
        </div>
        <div className="py-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              className={`w-full flex items-center justify-between px-4 py-2 text-xs transition-colors ${
                activeFilter === f.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 font-medium"
              }`}
            >
              <span className="capitalize">{f.label}</span>
              {f.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeFilter === f.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
