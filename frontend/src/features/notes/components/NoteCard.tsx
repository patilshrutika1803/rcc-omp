import { Bookmark } from "lucide-react";
import type { Note } from "../types/note";

export default function NoteCard(props: {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { note, isSelected, onSelect } = props;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors ${
        isSelected ? "bg-blue-50/50 border-l-2 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">
          {note.title}
        </div>
        {note.pinned && (
          <Bookmark size={11} className="text-amber-500 shrink-0 mt-0.5" />
        )}
      </div>
      <div className="text-[10px] text-slate-400 line-clamp-2 mb-1.5">
        {note.content}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-slate-400">{note.date}</span>
        {note.shared && (
          <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded">Shared</span>
        )}
        {note.tags.slice(0, 1).map((t) => (
          <span
            key={t}
            className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded"
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}

