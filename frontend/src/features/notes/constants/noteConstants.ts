import type { EditorState } from "../types/note";

// Folder names (UI labels). Counts are derived from notes (no demo data).
export const NOTE_FOLDERS = [
  "My Notes",
  "Pinned",
  "Shared Notes",
  "Maintenance Notes",
  "QA Documentation",
  "Backup Documentation",
  "Machine Manuals",
  "Department Documents",
  "Templates",
  "Knowledge Base",
] as const;

export const DEFAULT_EDITOR_STATE: EditorState = {
  isEditing: false,
  editContent: "",
};

// Rich text toolbar buttons (kept as static configuration for component rendering)
export const EDITOR_TOOLBAR_BUTTON_IDS = [
  "bold",
  "italic",
  "underline",
  "alignLeft",
  "list",
  "link",
  "image",
] as const;

