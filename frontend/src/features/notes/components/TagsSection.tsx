import { Hash, Plus } from "lucide-react";
import type { Note } from "../types/note";

export default function TagsSection({ note }: { note: Note }) {
  return (
    <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
      {note.tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
        >
          <Hash size={8} />{tag}
        </span>
      ))}
      <button className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-1">
        <Plus size={10} /> Tag
      </button>
    </div>
  );
}

