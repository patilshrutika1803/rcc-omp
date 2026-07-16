import type { ComponentType } from "react";
import {
  Archive,
  BookOpen,
  Bookmark,
  CheckSquare,
  FileText,
  Folder,
  Layers,
  Server,
  User,
  Wrench,
  Copy,
} from "lucide-react";

import type { Note } from "../types/note";
import { NOTE_FOLDERS } from "../constants/noteConstants";
import NotesSearch from "./NotesSearch";

const folderIcons: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  "My Notes": FileText,
  Pinned: Bookmark,
  "Shared Notes": User,
  "Maintenance Notes": Wrench,
  "QA Documentation": CheckSquare,
  "Backup Documentation": Archive,
  "Machine Manuals": Server,
  "Department Documents": Layers,
  Templates: Copy,
  "Knowledge Base": BookOpen,
};

export default function NotesSidebar(props: {
  selectedFolder: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSelectFolder: (folder: string) => void;
  folderCounts: Record<string, number>;
}) {
  const { selectedFolder, search, onSearchChange, onSelectFolder, folderCounts } = props;

  return (
    <div className="w-48 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <NotesSearch value={search} onChange={onSearchChange} />
      <div className="flex-1 overflow-y-auto py-1.5">
        {NOTE_FOLDERS.map((folder) => {
          const Icon = folderIcons[folder] || Folder;
          const count = folderCounts[folder] ?? 0;

          return (
            <button
              key={folder}
              onClick={() => onSelectFolder(folder)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                selectedFolder === folder
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 font-medium"
              }`}
            >
              <Icon
                size={13}
                className={
                  selectedFolder === folder ? "text-blue-600" : "text-slate-400"
                }
              />
              <span className="flex-1 text-left truncate">{folder}</span>
              {count > 0 && (
                <span
                  className={`text-[9px] font-bold px-1 rounded ${
                    selectedFolder === folder
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

