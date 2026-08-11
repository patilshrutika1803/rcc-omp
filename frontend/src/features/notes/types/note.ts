export type NoteFolder =
  | "My Notes"
  | "Pinned"
  | "Shared Notes"
  | "Maintenance Notes"
  | "QA Documentation"
  | "Backup Documentation"
  | "Machine Manuals"
  | "Department Documents"
  | "Templates"
  | "Knowledge Base";

export type NoteTag = string;

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  date: string;
  author: string;
  shared: boolean;
}

export interface EditorState {
  isEditing: boolean;
  editContent: string;
}

export interface NoteForm {
  title: string;
  content: string;
  folder: string;
  tags: string[];
  pinned: boolean;
  shared: boolean;
}

