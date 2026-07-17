import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

interface NotificationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotificationSearch({ value, onChange }: NotificationSearchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Search notifications..."
        value={value}
        onChange={handleChange}
        className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
      />
    </div>
  );
}
