import { FileText } from "lucide-react";
import type { Note } from "../types/note";
import EditorToolbar from "./EditorToolbar";
import NoteHeader from "./NoteHeader";
import TagsSection from "./TagsSection";

export default function NoteEditor(props: {
  note: Note | null;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (v: string) => void;
  onToggleEditing: () => void;
  onSave: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}) {
  const {
    note,
    isEditing,
    editContent,
    onEditContentChange,
    onToggleEditing,
    onSave,
    onCopyLink,
    onDelete,
  } = props;

  return (
    <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
      {note ? (
        <>
          <NoteHeader
            note={note}
            isEditing={isEditing}
            onToggleEditing={onToggleEditing}
            onSave={onSave}
            onCopyLink={onCopyLink}
            onDelete={onDelete}
          />

          {isEditing && <EditorToolbar />}

          <div className="flex-1 overflow-y-auto p-5">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                className="w-full h-full min-h-[300px] text-sm text-slate-800 leading-relaxed bg-transparent border-none focus:outline-none resize-none font-mono"
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {note.content}
                </pre>
              </div>
            )}
          </div>

          <TagsSection note={note} />
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <FileText size={32} className="text-slate-200 mb-3" />
          <div className="text-sm font-bold text-slate-600 mb-1">Select a note</div>
          <div className="text-xs text-slate-400">Choose a note from the list to view or edit.</div>
        </div>
      )}
    </div>
  );
}

