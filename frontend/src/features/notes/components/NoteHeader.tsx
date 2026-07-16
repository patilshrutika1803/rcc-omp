import { ExternalLink, Trash2, Edit2, Check, User, } from "lucide-react";
import type { Note } from "../types/note";

export default function NoteHeader(props: {
  note: Note;
  isEditing: boolean;
  onToggleEditing: () => void;
  onSave: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}) {
  const { note, isEditing, onToggleEditing, onSave, onCopyLink, onDelete } = props;

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">{note.title}</div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <User size={9} />{note.author} · {note.date}
            {note.shared && (
              <>
                <span>·</span>
                <span className="text-blue-600">Shared</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggleEditing}
          className={`flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold rounded-lg border transition-colors ${
            isEditing
              ? "bg-blue-600 text-white border-blue-600"
              : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Edit2 size={11} /> {isEditing ? "Editing" : "Edit"}
        </button>

        {isEditing && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-white bg-emerald-600 rounded-lg border border-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            <Check size={11} /> Save
          </button>
        )}

        <button
          onClick={onCopyLink}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ExternalLink size={14} />
        </button>

        <button
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

