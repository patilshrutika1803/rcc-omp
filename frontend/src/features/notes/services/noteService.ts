import type { Note } from "../types/note";

const STORAGE_KEY = "rcc_omp_notes_v1";

function safeParseNotes(raw: string | null): Note[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as Note[];
  } catch {
    return [];
  }
}

function readAll(): Note[] {
  return safeParseNotes(localStorage.getItem(STORAGE_KEY));
}

function writeAll(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function generateId(): string {
  // Deterministic enough for local usage.
  return `note_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeNote(input: Partial<Note> & { id?: string }): Note {
  const now = new Date().toISOString();
  return {
    id: input.id ?? generateId(),
    title: (input.title ?? "Untitled").toString(),
    content: (input.content ?? "").toString(),
    folder: (input.folder ?? "My Notes").toString(),
    tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
    pinned: Boolean(input.pinned),
    date: (input.date ?? now).toString(),
    author: (input.author ?? "You").toString(),
    shared: Boolean(input.shared),
  };
}

export async function getNotes(): Promise<Note[]> {
  return readAll();
}

export async function getNote(id: string): Promise<Note | null> {
  const notes = readAll();
  return notes.find((n) => n.id === id) ?? null;
}

export async function createNote(payload: Partial<Note>): Promise<Note | null> {
  const notes = readAll();
  const next = normalizeNote({ ...payload, id: undefined });

  // Ensure folder is valid for special folders.
  if (next.folder === "Pinned" || next.folder === "Shared Notes") next.folder = "My Notes";

  const updated = [next, ...notes];
  writeAll(updated);
  return next;
}

export async function updateNote(
  id: string,
  payload: Partial<Note>
): Promise<Note | null> {
  const notes = readAll();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return null;

  const prev = notes[idx];
  const next: Note = {
    ...prev,
    ...payload,
    tags: payload.tags !== undefined ? payload.tags : prev.tags,
    pinned: payload.pinned !== undefined ? payload.pinned : prev.pinned,
    shared: payload.shared !== undefined ? payload.shared : prev.shared,
    title: payload.title !== undefined ? payload.title : prev.title,
    content: payload.content !== undefined ? payload.content : prev.content,
    folder: payload.folder !== undefined ? payload.folder : prev.folder,
    date: payload.date !== undefined ? payload.date : new Date().toISOString(),
  };

  // Avoid storing special UI folders as note.folder.
  if (next.folder === "Pinned" || next.folder === "Shared Notes") next.folder = "My Notes";

  const updated = [...notes];
  updated[idx] = next;
  writeAll(updated);
  return next;
}

export async function deleteNote(id: string): Promise<void> {
  const notes = readAll().filter((n) => n.id !== id);
  writeAll(notes);
}

export async function duplicateNote(id: string): Promise<Note | null> {
  const notes = readAll();
  const src = notes.find((n) => n.id === id);
  if (!src) return null;

  const dup: Note = {
    ...src,
    id: generateId(),
    title: src.title ? `${src.title} (Copy)` : "Untitled (Copy)",
    date: new Date().toISOString(),
    pinned: false,
    shared: false,
  };

  writeAll([dup, ...notes]);
  return dup;
}

export async function pinNote(id: string, pinned: boolean): Promise<Note | null> {
  return updateNote(id, { pinned });
}

export async function shareNote(id: string, shared: boolean): Promise<Note | null> {
  return updateNote(id, { shared });
}

export async function searchNotes(query: string): Promise<Note[]> {
  const notes = readAll();
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );
}


