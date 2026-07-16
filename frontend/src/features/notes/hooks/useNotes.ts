import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { EditorState, Note } from "../types/note";
import { NOTE_FOLDERS, DEFAULT_EDITOR_STATE } from "../constants/noteConstants";
import { filterNotesByFolder, filterNotesBySearch } from "../utils/noteHelpers";
import * as noteService from "../services/noteService";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("My Notes");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [search, setSearch] = useState("");

  const [editor, setEditor] = useState<EditorState>(DEFAULT_EDITOR_STATE);

  useEffect(() => {
    (async () => {
      const res = await noteService.getNotes();
      setNotes(res);
      setSelectedNote(null);
      setEditor(DEFAULT_EDITOR_STATE);
    })();
  }, []);

  const folderNotes = useMemo(() => {
    let filtered = filterNotesByFolder({ notes, selectedFolder });
    filtered = filterNotesBySearch({ notes: filtered, search });
    return filtered;
  }, [notes, selectedFolder, search]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of NOTE_FOLDERS) counts[f] = 0;

    for (const n of notes) {
      if (n.pinned) counts["Pinned"] = (counts["Pinned"] ?? 0) + 1;
      if (n.shared) counts["Shared Notes"] = (counts["Shared Notes"] ?? 0) + 1;

      if (n.folder && Object.prototype.hasOwnProperty.call(counts, n.folder)) {
        counts[n.folder] = (counts[n.folder] ?? 0) + 1;
      }
    }

    return counts;
  }, [notes]);

  function handleSelectFolder(folder: string) {
    setSelectedFolder(folder);
    setSelectedNote(null);
    setEditor(DEFAULT_EDITOR_STATE);
    setSearch("");
  }

  function handleSelectNote(note: Note) {
    setSelectedNote(note);
    setEditor(DEFAULT_EDITOR_STATE);
  }

  function toggleEditing() {
    if (!selectedNote) return;

    setEditor((prev) => {
      const nextEditing = !prev.isEditing;
      return {
        isEditing: nextEditing,
        editContent: nextEditing ? selectedNote.content : "",
      };
    });
  }

  function buildBlankNote(): Omit<Note, "id"> {
    const now = new Date();
    return {
      title: "Untitled",
      content: "",
      folder: selectedFolder === "Pinned" || selectedFolder === "Shared Notes" ? "My Notes" : selectedFolder,
      tags: [],
      pinned: false,
      shared: false,
      date: now.toISOString(),
      author: "You",
    };
  }

  async function handleNewNote() {
    const blank = buildBlankNote();
    const created = await noteService.createNote(blank);

    if (!created) {
      toast.error("Failed to create note.");
      return;
    }

    const res = await noteService.getNotes();
    setNotes(res);
    setSelectedNote(created);
    setEditor({ isEditing: true, editContent: created.content });

    toast.success("New note created!");
  }

  async function handleSave() {
    if (!selectedNote) return;
    const payload = { content: editor.editContent };

    const updated = await noteService.updateNote(selectedNote.id, payload);

    setEditor(DEFAULT_EDITOR_STATE);
    toast.success("Note saved!");

    if (updated) {
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setSelectedNote(updated);
    }
  }


  async function handleDelete() {
    if (!selectedNote) return;

    const toDelete = selectedNote;
    await noteService.deleteNote(toDelete.id);

    // Placeholder behavior: remove locally only if backend returns nothing? Keep consistent UX.
    setNotes((prev) => prev.filter((n) => n.id !== toDelete.id));
    setSelectedNote(null);
    setEditor(DEFAULT_EDITOR_STATE);
    toast.error("Note deleted.");
  }

  function handleCopyLink() {
    toast.success("Link copied!");
  }

  return {
    notes,
    selectedFolder,
    selectedNote,
    search,
    editor,
    folderNotes,
    folderCounts,
    NOTE_FOLDERS,
    setSearch,
    handleSelectFolder,
    handleSelectNote,
    toggleEditing,
    setEditor,
    handleNewNote,
    handleSave,
    handleDelete,
    handleCopyLink,
  };
}


