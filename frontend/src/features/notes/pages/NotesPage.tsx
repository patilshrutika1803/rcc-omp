// ─────────────────────────────────────────────────────────────────────────────
// NotesPage
// Extracted from the original monolithic App.tsx (RCC OMP).
// Behavior, styling and Tailwind classes are unchanged from the original.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Wrench,
  Archive,
  CheckSquare,
  Server,
  FileText,
  Search,
  User,
  ChevronRight,
  Check,
  Plus,
  Edit2,
  Trash2,
  Layers,
  ExternalLink,
  Copy,
  Tag,
  BookOpen,
  Bookmark,
  Hash,
  Folder,
  Link2,
  Bold,
  Italic,
  List,
  Underline,
  AlignLeft,
  Image
} from "lucide-react";
import { toast } from "sonner";


// ─────────────────────────────────────────────────────────────────────────────
// NOTES MODULE
// ─────────────────────────────────────────────────────────────────────────────

interface Note {
  id: string; title: string; content: string; folder: string; tags: string[];
  pinned: boolean; date: string; author: string; shared: boolean;
}

export const ALL_NOTES: Note[] = [
  { id: "NOTE-001", title: "Firewall Policy Review Notes", content: "Review new firewall policies before EOD.\n\n• Check inbound rules for RDP access\n• Verify DMZ zone segmentation\n• Update VLAN configurations for QA lab\n• Test failover with secondary ISP\n\nContact: Vikram Singh (Ext. 201)", folder: "My Notes", tags: ["Security", "IT", "Urgent"], pinned: true, date: "2026-07-03", author: "Arun Sharma", shared: false },
  { id: "NOTE-002", title: "Q3 Maintenance Schedule Draft", content: "Prep Q3 maintenance schedule for all departments.\n\n• Production: Filling Machine A – Aug 3\n• IT: UPS Semi-annual PM – Jul 15\n• Engineering: Chiller overdue – URGENT\n• Warehouse: Conveyor bi-weekly – Jul 17\n\nApproval needed from Plant Manager by July 8.", folder: "Maintenance Notes", tags: ["PM", "Schedule", "Q3"], pinned: true, date: "2026-07-02", author: "Arun Sharma", shared: true },
  { id: "NOTE-003", title: "ISP Latency Issue – Follow-up", content: "Follow up with ISP vendor regarding latency issues affecting ERP performance.\n\n• Ticket #ISP-2026-0042 opened June 28\n• SLA: 48h response, 96h resolution\n• Baseline latency: 12ms, current: 38ms\n• Impact: ERP, email, backup jobs\n\nEscalate to Tata Communications NOC if no response by July 5.", folder: "IT Department", tags: ["Network", "Vendor", "ISP"], pinned: false, date: "2026-07-01", author: "Vikram Singh", shared: false },
  { id: "NOTE-004", title: "GMP Audit Checklist – July 2026", content: "GMP compliance audit scheduled for July 15, 2026.\n\nAreas to cover:\n1. Documentation control (SOPs, batch records)\n2. Equipment calibration certificates\n3. Cleaning validation records\n4. Personnel training records\n5. Deviation & CAPA management\n6. Environmental monitoring\n\nLead: Dr. Anita Desai\nAuditor: Regulatory Team", folder: "QA Documentation", tags: ["GMP", "Audit", "QA"], pinned: false, date: "2026-06-30", author: "Anita Desai", shared: true },
  { id: "NOTE-005", title: "Backup Strategy – DR Plan Update", content: "Update Disaster Recovery plan for 2026 H2.\n\nKey changes:\n• Move tape library to offsite location\n• Implement 3-2-1 backup rule for all critical servers\n• Add Azure cold storage for archival\n• Test recovery procedures quarterly\n• Update RTO/RPO targets\n\nRTO: 4 hours → 2 hours\nRPO: 24 hours → 8 hours", folder: "Backup Documentation", tags: ["DR", "Backup", "Cloud"], pinned: false, date: "2026-06-28", author: "Arjun Rao", shared: true },
  { id: "NOTE-006", title: "CNC Machine Repair Log", content: "CNC Lathe MCH-CNC-001 repair log:\n\nIncident: Power failure + spindle drive fault\nDate: July 1, 2026\nUser: Rajesh Kumar\n\nSteps taken:\n1. Isolated power supply unit\n2. Diagnosed spindle drive fault code E-0442\n3. Ordered replacement drive (Siemens SINAMICS)\n4. Estimated repair time: 3-4 days\n5. Machine quarantined – DO NOT USE", folder: "Machine Manuals", tags: ["CNC", "Repair", "Downtime"], pinned: false, date: "2026-07-01", author: "Rajesh Kumar", shared: false },
  { id: "NOTE-007", title: "Production Team Meeting – Minutes", content: "Weekly production team meeting, July 2, 2026.\n\nAttendees: Rakesh Malhotra, Priya Nair, Rajesh Kumar, Kavita Sharma\n\nAgenda:\n1. Line A throughput review – achieved 98% target\n2. CNC machine downtime impact – 2 shifts affected\n3. Packaging Machine PM scheduled for tomorrow\n4. Q3 production targets discussion\n5. Safety training reminder – July 14\n\nNext meeting: July 9, 2026", folder: "Department Documents", tags: ["Meeting", "Production", "Minutes"], pinned: false, date: "2026-07-02", author: "Rakesh Malhotra", shared: true },
  { id: "NOTE-008", title: "Energy Consumption Analysis – H1 2026", content: "H1 2026 Energy Consumption Summary:\n\nTotal consumption: 2.4 MW/month average\nTop consumers:\n1. Production Floor – 48%\n2. HVAC Systems – 22%\n3. Compressed Air – 16%\n4. Lighting – 8%\n5. IT Equipment – 6%\n\nRecommendations:\n• Variable frequency drives for compressors\n• LED retrofit for factory floor\n• Power factor correction", folder: "Department Documents", tags: ["Energy", "Analytics", "Engineering"], pinned: false, date: "2026-06-25", author: "Ramesh Nair", shared: true },
];

const NOTE_FOLDERS = ["My Notes", "Pinned", "Shared Notes", "Maintenance Notes", "QA Documentation", "Backup Documentation", "Machine Manuals", "Department Documents", "Templates", "Knowledge Base"];

export default function NotesPage() {
  const [selectedFolder, setSelectedFolder] = useState("My Notes");
  const [selectedNote, setSelectedNote] = useState<Note | null>(ALL_NOTES[0]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const folderNotes = useMemo(() => {
    let notes = ALL_NOTES;
    if (selectedFolder === "Pinned") notes = notes.filter(n => n.pinned);
    else if (selectedFolder === "Shared Notes") notes = notes.filter(n => n.shared);
    else if (selectedFolder !== "My Notes" && selectedFolder !== "Templates" && selectedFolder !== "Knowledge Base") notes = notes.filter(n => n.folder === selectedFolder);
    if (search) notes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));
    return notes;
  }, [selectedFolder, search]);

  const folderIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    "My Notes": FileText, "Pinned": Bookmark, "Shared Notes": User, "Maintenance Notes": Wrench,
    "QA Documentation": CheckSquare, "Backup Documentation": Archive, "Machine Manuals": Server,
    "Department Documents": Layers, "Templates": Copy, "Knowledge Base": BookOpen,
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} /><span>Dashboard</span><ChevronRight size={12} /><span className="text-slate-700 font-semibold">Notes & Knowledge Base</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200"><FileText size={20} className="text-white" /></div>
            <div><h1 className="text-xl font-bold text-slate-900 tracking-tight">Notes & Knowledge Base</h1><p className="text-xs text-slate-500 mt-0.5">{ALL_NOTES.length} notes · {ALL_NOTES.filter(n => n.shared).length} shared</p></div>
          </div>
          <button onClick={() => toast.success("New note created!")} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><Plus size={13} /> New Note</button>
        </div>
      </div>

      <div className="flex gap-4" style={{ height: "calc(100vh - 280px)", minHeight: 500 }}>
        {/* Folders Sidebar */}
        <div className="w-48 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-3 py-3 border-b border-slate-100">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-7 pl-7 pr-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-400 transition-all placeholder-slate-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1.5">
            {NOTE_FOLDERS.map(folder => {
              const Icon = folderIcons[folder] || Folder;
              const count = folder === "Pinned" ? ALL_NOTES.filter(n => n.pinned).length : folder === "Shared Notes" ? ALL_NOTES.filter(n => n.shared).length : ALL_NOTES.filter(n => n.folder === folder).length;
              return (
                <button key={folder} onClick={() => setSelectedFolder(folder)} className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${selectedFolder === folder ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 font-medium"}`}>
                  <Icon size={13} className={selectedFolder === folder ? "text-blue-600" : "text-slate-400"} />
                  <span className="flex-1 text-left truncate">{folder}</span>
                  {count > 0 && <span className={`text-[9px] font-bold px-1 rounded ${selectedFolder === folder ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note List */}
        <div className="w-64 shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{selectedFolder}</span>
            <span className="text-[10px] text-slate-400">{folderNotes.length} notes</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {folderNotes.length === 0 ? (
              <div className="p-6 text-center"><FileText size={24} className="text-slate-200 mx-auto mb-2" /><div className="text-xs text-slate-400">No notes in this folder</div></div>
            ) : folderNotes.map(note => (
              <button key={note.id} onClick={() => { setSelectedNote(note); setIsEditing(false); }} className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors ${selectedNote?.id === note.id ? "bg-blue-50/50 border-l-2 border-l-blue-500" : ""}`}>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">{note.title}</div>
                  {note.pinned && <Bookmark size={11} className="text-amber-500 shrink-0 mt-0.5" />}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mb-1.5">{note.content}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400">{note.date}</span>
                  {note.shared && <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded">Shared</span>}
                  {note.tags.slice(0,1).map(t => <span key={t} className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">{t}</span>)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {selectedNote ? (
            <>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{selectedNote.title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <User size={9} />{selectedNote.author} · {selectedNote.date}
                      {selectedNote.shared && <><span>·</span><span className="text-blue-600">Shared</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setIsEditing(!isEditing); setEditContent(selectedNote.content); }} className={`flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold rounded-lg border transition-colors ${isEditing ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"}`}><Edit2 size={11} /> {isEditing ? "Editing" : "Edit"}</button>
                  {isEditing && <button onClick={() => { setIsEditing(false); toast.success("Note saved!"); }} className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold text-white bg-emerald-600 rounded-lg border border-emerald-600 hover:bg-emerald-700 transition-colors"><Check size={11} /> Save</button>}
                  <button onClick={() => toast.success("Link copied!")} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><ExternalLink size={14} /></button>
                  <button onClick={() => toast.error("Note deleted.")} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Toolbar (editing) */}
              {isEditing && (
                <div className="flex items-center gap-1 px-5 py-2 border-b border-slate-100 bg-slate-50/50">
                  {[Bold, Italic, Underline, AlignLeft, List, Link2, Image].map((Icon, i) => (
                    <button key={i} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors"><Icon size={14} /></button>
                  ))}
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <select className="h-7 px-2 text-[11px] bg-white border border-slate-200 rounded-md text-slate-600 focus:outline-none">
                    <option>Normal</option><option>Heading 1</option><option>Heading 2</option><option>Code</option>
                  </select>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-5">
                {isEditing ? (
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full h-full min-h-[300px] text-sm text-slate-800 leading-relaxed bg-transparent border-none focus:outline-none resize-none font-mono" />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">{selectedNote.content}</pre>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
                {selectedNote.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"><Hash size={8} />{tag}</span>
                ))}
                <button className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors ml-1"><Plus size={10} /> Tag</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <FileText size={32} className="text-slate-200 mb-3" />
              <div className="text-sm font-bold text-slate-600 mb-1">Select a note</div>
              <div className="text-xs text-slate-400">Choose a note from the list to view or edit.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
