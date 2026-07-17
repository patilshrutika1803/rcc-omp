import React, { useState } from "react";
import { X, Clock, RotateCcw, Edit2, XCircle, RefreshCw, Archive } from "lucide-react";
import type { BackupJob } from "../../types/backup";
import { bkpStatusCfg } from "../../utils/backupHelpers";
import { computeUsedPct } from "../../utils/backupCalculations";
import { BkpStatusBadge } from "./BackupStatusBadge";
import { BkpTypeBadge } from "./BackupTypeBadge";

export function BackupJobDrawer({ job, onClose, onEdit, onRunNow }: {
  job: BackupJob;
  onClose: () => void;
  onEdit: () => void;
  onRunNow: () => void;
}) {
  const [tab, setTab] = useState<"info" | "history" | "timeline">("info");
  const tabs = [
    { id: "info",     label: "Job Info"    },
    { id: "history",  label: "Run History" },
    { id: "timeline", label: "Timeline"    },
  ] as const;

  const usedPct = computeUsedPct(job.sizeGB, job.quota);

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="w-[540px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Archive size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">{job.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{job.id} · {job.server}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <BkpStatusBadge status={job.status} />
            <BkpTypeBadge type={job.backupType} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
              <RotateCcw size={10} /> {job.frequency}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "info" && (
            <div className="space-y-5">
              {job.status === "Running" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex justify-between text-xs font-semibold text-blue-700 mb-2">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Running…</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Department",  value: job.department  },
                  { label: "Destination", value: job.destination },
                  { label: "Last Backup", value: job.lastBackup  },
                  { label: "Next Backup", value: job.nextBackup  },
                  { label: "Frequency",   value: job.frequency   },
                  { label: "Backup Type", value: job.backupType  },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-xs font-semibold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Storage card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-700">Storage Used</span>
                  <span className="text-sm font-bold text-slate-900">{job.sizeGB} GB / {job.quota} GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                  <div
                    className={`h-2.5 rounded-full ${usedPct > 80 ? "bg-red-500" : usedPct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(usedPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Used: {job.sizeGB} GB</span>
                  <span>Quota: {job.quota} GB</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-emerald-600 font-semibold mb-1">Last Verified</div>
                  <div className="text-sm font-bold text-emerald-800">{job.lastVerified}</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-600 font-semibold mb-1">Recovery Points</div>
                  <div className="text-sm font-bold text-blue-800">{job.recoveryPoints} points</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">Assigned User</div>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {job.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{job.user}</div>
                    <div className="text-[11px] text-slate-500">{job.department}</div>
                  </div>
                </div>
              </div>

              {job.description && (
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2">Description</div>
                  <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 leading-relaxed">{job.description}</div>
                </div>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-700">Run History</h3>
                <span className="text-[11px] text-slate-400">{job.history.length} records</span>
              </div>
              {job.history.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400">No run history yet.</div>
              )}
              {job.history.map((h, i) => {
                const c = bkpStatusCfg(h.status);
                return (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">{h.date}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>{h.status}</span>
                    </div>
                    <div className="flex gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> {h.duration}</span>
                      {h.sizeGB > 0 && <span>{h.sizeGB} GB</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "timeline" && (
            <div>
              <div className="text-xs font-bold text-slate-700 mb-4">Execution Timeline</div>
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-5">
                {[
                  { time: "2 mins ago",   title: "Status updated", desc: `Job status changed to ${job.status}`,                         color: "bg-blue-400"    },
                  { time: job.lastBackup, title: "Job executed",   desc: `${job.backupType} backup completed in ${job.duration}`,        color: "bg-emerald-400" },
                  { time: "Scheduled",    title: "Job scheduled",  desc: `Next run: ${job.nextBackup}`,                                  color: "bg-slate-300"   },
                  { time: "On creation",  title: "Job created",    desc: `Backup job configured by ${job.user}`,                     color: "bg-slate-200"   },
                ].map((log, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${log.color}`} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{log.time}</div>
                    <div className="text-xs font-bold text-slate-800">{log.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{log.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
          <button onClick={onEdit} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            <Edit2 size={13} /> Edit
          </button>
          {job.status === "Running" && (
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
              <XCircle size={13} /> Cancel
            </button>
          )}
          <button onClick={onRunNow} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw size={13} /> Run Now
          </button>
        </div>
      </div>
    </div>
  );
}
