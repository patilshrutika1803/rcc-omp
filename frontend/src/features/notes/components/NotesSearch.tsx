import { Search } from "lucide-react";

export default function NotesSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="px-3 py-3 border-b border-slate-100">
      <div className="relative">
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-7 pl-7 pr-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 transition-all placeholder-slate-400"
        />
      </div>
    </div>
  );
}

