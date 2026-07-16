import { FileText } from "lucide-react";
import type { Note } from "../types/note";
import EmptyNotes from "./EmptyNotes";
import NoteCard from "./NoteCard";

export default function NotesList(props: {
  selectedFolder: string;
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
}) {
  const { selectedFolder, notes, selectedNoteId, onSelectNote } = props;

  return (
    <div className="w-64 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">{selectedFolder}</span>
        <span className="text-[10px] text-slate-400">{notes.length} notes</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {notes.length === 0 ? (
          <EmptyNotes message="No notes in this folder" />
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={() => onSelectNote(note)}
            />
          ))
        )}
      </div>
    </div>
  );
}

