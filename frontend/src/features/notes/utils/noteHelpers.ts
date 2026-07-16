import type { Note, NoteForm } from "../types/note";

export function filterNotesByFolder(opts: {
  notes: Note[];
  selectedFolder: string;
}): Note[] {
  const { notes, selectedFolder } = opts;

  let filtered = notes;
  if (selectedFolder === "Pinned") filtered = filtered.filter((n) => n.pinned);
  else if (selectedFolder === "Shared Notes") filtered = filtered.filter((n) => n.shared);
  else if (
    selectedFolder !== "My Notes" &&
    selectedFolder !== "Templates" &&
    selectedFolder !== "Knowledge Base"
  ) {
    filtered = filtered.filter((n) => n.folder === selectedFolder);
  }

  return filtered;
}

export function filterNotesBySearch(opts: {
  notes: Note[];
  search: string;
}): Note[] {
  const { notes, search } = opts;
  if (!search) return notes;

  const q = search.toLowerCase();
  return notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );
}

export function computeFolderCounts(opts: {
  notes: Note[];
}): Record<string, number> {
  const { notes } = opts;

  const counts: Record<string, number> = {
    "My Notes": notes.filter((n) => n.folder === "My Notes").length,
    Pinned: notes.filter((n) => n.pinned).length,
    "Shared Notes": notes.filter((n) => n.shared).length,
  };

  for (const n of notes) {
    if (!counts[n.folder]) counts[n.folder] = 0;
    if (n.folder && n.folder !== "My Notes") counts[n.folder] += 1;
  }

  return counts;
}

export function createEmptyNoteForm(): NoteForm {
  return {
    title: "",
    content: "",
    folder: "My Notes",
    tags: [],
    pinned: false,
    shared: false,
  };
}

export function safePreviewText(text: string): string {
  return text;
}

