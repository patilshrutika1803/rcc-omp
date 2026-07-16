import { FileText } from "lucide-react";

export default function EmptyNotes({ message }: { message: string }) {
  return (
    <div className="p-6 text-center">
      <FileText size={24} className="text-slate-200 mx-auto mb-2" />
      <div className="text-xs text-slate-400">{message}</div>
    </div>
  );
}

