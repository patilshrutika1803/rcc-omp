import type { Note } from "../types/note";
import { getAuthState } from "../../../auth/auth";

const STORAGE_KEY = "rcc_omp_notes_v1";

type NotesStore = Record<string, Note[]>;

function getCurrentUserId(): string | null {
  const authState = getAuthState();
  if (!authState?.user) return null;
  return authState.user.employeeId?.trim() || authState.user.email.trim();
}

function getCurrentUserName(): string {
  const authState = getAuthState();
  return authState?.user?.name || authState?.user?.email || "You";
}

function safeParseStore(raw: string | null): NotesStore {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) return {};
      const migratedNotes = parsed
        .filter(Boolean)
        .map((item) => normalizeNote({ ...((item as Note) ?? {}), userId: currentUserId }));
      const store: NotesStore = { [currentUserId]: migratedNotes };
      writeStore(store);
      return store;
    }

    if (parsed && typeof parsed === "object") {
      const store = parsed as NotesStore;
      const normalized: NotesStore = {};
      for (const [key, value] of Object.entries(store)) {
        if (!Array.isArray(value)) continue;
        normalized[key] = value
          .filter(Boolean)
          .map((item) => normalizeNote({ ...((item as Note) ?? {}), userId: key }));
      }
      return normalized;
    }
  } catch {
    // ignore and return empty store
  }
  return {};
}

function readStore(): NotesStore {
  return safeParseStore(localStorage.getItem(STORAGE_KEY));
}

function writeStore(store: NotesStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getNotesForCurrentUser(): Note[] {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const store = readStore();
  return store[userId] ?? [];
}

function saveNotesForCurrentUser(notes: Note[]): void {
  const userId = getCurrentUserId();
  if (!userId) return;
  const store = readStore();
  writeStore({
    ...store,
    [userId]: notes,
  });
}

function generateId(): string {
  // Deterministic enough for local usage.
  return `note_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeNote(input: Partial<Note> & { id?: string }): Note {
  const now = new Date().toISOString();
  return {
    id: input.id ?? generateId(),
    userId: input.userId ?? getCurrentUserId() ?? "unknown",
    title: (input.title ?? "Untitled").toString(),
    content: (input.content ?? "").toString(),
    folder: (input.folder ?? "My Notes").toString(),
    tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
    pinned: Boolean(input.pinned),
    date: (input.date ?? now).toString(),
    author: (input.author ?? getCurrentUserName() ?? "You").toString(),
    shared: Boolean(input.shared),
  };
}

export async function getNotes(): Promise<Note[]> {
  return getNotesForCurrentUser();
}

export async function getNote(id: string): Promise<Note | null> {
  const notes = getNotesForCurrentUser();
  return notes.find((n) => n.id === id) ?? null;
}

export async function createNote(payload: Partial<Note>): Promise<Note | null> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return null;

  const notes = getNotesForCurrentUser();
  const next = normalizeNote({ ...payload, id: undefined, userId: currentUserId });

  if (next.folder === "Pinned" || next.folder === "Shared Notes") next.folder = "My Notes";

  const updated = [next, ...notes];
  saveNotesForCurrentUser(updated);
  return next;
}

export async function updateNote(
  id: string,
  payload: Partial<Note>
): Promise<Note | null> {
  const notes = getNotesForCurrentUser();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return null;

  const prev = notes[idx];
  const next: Note = {
    ...prev,
    ...payload,
    userId: prev.userId,
    tags: payload.tags !== undefined ? payload.tags : prev.tags,
    pinned: payload.pinned !== undefined ? payload.pinned : prev.pinned,
    shared: payload.shared !== undefined ? payload.shared : prev.shared,
    title: payload.title !== undefined ? payload.title : prev.title,
    content: payload.content !== undefined ? payload.content : prev.content,
    folder: payload.folder !== undefined ? payload.folder : prev.folder,
    date: payload.date !== undefined ? payload.date : new Date().toISOString(),
  };

  if (next.folder === "Pinned" || next.folder === "Shared Notes") next.folder = "My Notes";

  const updated = [...notes];
  updated[idx] = next;
  saveNotesForCurrentUser(updated);
  return next;
}

export async function deleteNote(id: string): Promise<void> {
  const notes = getNotesForCurrentUser();
  const updated = notes.filter((n) => n.id !== id);
  saveNotesForCurrentUser(updated);
}

export async function duplicateNote(id: string): Promise<Note | null> {
  const notes = getNotesForCurrentUser();
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

  saveNotesForCurrentUser([dup, ...notes]);
  return dup;
}

export async function pinNote(id: string, pinned: boolean): Promise<Note | null> {
  return updateNote(id, { pinned });
}

export async function shareNote(id: string, shared: boolean): Promise<Note | null> {
  return updateNote(id, { shared });
}

export async function searchNotes(query: string): Promise<Note[]> {
  const notes = getNotesForCurrentUser();
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter(
    (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
  );
}


