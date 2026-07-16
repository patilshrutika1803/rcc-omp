import { AlignLeft, Bold, Image, Italic, Link2, List, Underline } from "lucide-react";

const TOOL_ICONS = [Bold, Italic, Underline, AlignLeft, List, Link2, Image] as const;

export default function EditorToolbar() {
  return (
    <div className="flex items-center gap-1 px-5 py-2 border-b border-slate-100 bg-slate-50/50">
      {TOOL_ICONS.map((Icon, i) => (
        <button
          key={i}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors"
        >
          <Icon size={14} />
        </button>
      ))}
      <div className="w-px h-4 bg-slate-200 mx-1" />
      <select className="h-7 px-2 text-[11px] bg-white border border-slate-200 rounded-md text-slate-600 focus:outline-none">
        <option>Normal</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
        <option>Code</option>
      </select>
    </div>
  );
}

