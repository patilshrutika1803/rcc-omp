import { Search } from "lucide-react";

interface QASearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function QASearchBar({ search, onSearchChange }: QASearchBarProps) {
  return (
    <div className="relative w-72">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search by QMS No., Type, Dept..."
        className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      />
    </div>
  );
}
