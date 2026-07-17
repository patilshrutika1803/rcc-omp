// ─────────────────────────────────────────────────────────────────────────────
// PersonalNotesCard
// Data comes via props. Uncontrolled textarea, same as the original.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { FileText } from "lucide-react";

interface PersonalNotesCardProps {
  content: string;
}

export default function PersonalNotesCard({ content }: PersonalNotesCardProps) {
  return (
    <div className="bg-amber-50/50 border border-amber-100 rounded-xl shadow-sm p-5 relative">
      <div className="absolute top-0 left-4 right-4 h-1 bg-amber-200 rounded-b-md" />
      <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
        <FileText size={16} className="text-amber-500" /> Personal Notes
      </h3>
      <textarea
        key={content}
        className="w-full h-24 bg-transparent border-none text-xs text-amber-900 focus:outline-none focus:ring-0 resize-none placeholder-amber-700/50 leading-relaxed"
        placeholder="Jot down quick reminders..."
        defaultValue={content}
      />
    </div>
  );
}
