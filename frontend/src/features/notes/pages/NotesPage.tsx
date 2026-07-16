// ─────────────────────────────────────────────────────────────────────────────
// NotesPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { ChevronRight, FileText, LayoutDashboard, Plus } from "lucide-react";


import { useNotes } from "../hooks/useNotes";
import NotesSidebar from "../components/NotesSidebar";
import NotesList from "../components/NotesList";
import NoteEditor from "../components/NoteEditor";

export const ALL_NOTES = [] as any[];

export default function NotesPage() {
  const {
    selectedFolder,
    selectedNote,
    search,
    editor,
    folderNotes,
    folderCounts,
    setSearch,
    handleSelectFolder,
    handleSelectNote,
    toggleEditing,
    setEditor,
    handleSave,
    handleDelete,
    handleCopyLink,
    handleNewNote,
    notes,
  } = useNotes();


  const sharedCount = notes.filter((n) => n.shared).length;

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Notes & Knowledge Base</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Notes & Knowledge Base
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {notes.length} notes · {sharedCount} shared
              </p>
            </div>
          </div>
          <button
            onClick={handleNewNote}
            className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={13} /> New Note
          </button>

        </div>
      </div>

      <div
        className="flex gap-4"
        style={{ height: "calc(100vh - 280px)", minHeight: 500 }}
      >
        {/* Folders Sidebar */}
        <NotesSidebar
          selectedFolder={selectedFolder}
          search={search}
          onSearchChange={setSearch}
          onSelectFolder={handleSelectFolder}
          folderCounts={folderCounts}
        />

        {/* Note List */}
        <NotesList
          selectedFolder={selectedFolder}
          notes={folderNotes}
          selectedNoteId={selectedNote?.id ?? null}
          onSelectNote={(note) => handleSelectNote(note)}
        />

        {/* Note Editor */}
        <NoteEditor
          note={selectedNote}
          isEditing={editor.isEditing}
          editContent={editor.editContent}
          onEditContentChange={(v) =>
            setEditor({ isEditing: editor.isEditing, editContent: v })
          }
          onToggleEditing={toggleEditing}
          onSave={handleSave}
          onCopyLink={handleCopyLink}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

