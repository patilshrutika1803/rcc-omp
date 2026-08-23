import React, { useState } from "react";
import { X, CalendarClock, Edit2 } from "lucide-react";
import type { SystemInventory } from "../types/system";
import { daysUntilInventoryDate, formatInventoryDate, typeIcon } from "../utils/systemHelpers";
import { SystemStatusBadge } from "./SystemStatusBadge";
import { getActiveInspections, getCompletedInspections } from "../services/systemInspectionService";
import { formatDate } from "../../../shared/utils/dateHelpers";

export function SystemDetailsDrawer({ system, onClose, onEdit, onOpenComplete }: { system: SystemInventory; onClose: () => void; onEdit: () => void; onOpenComplete?: () => void }) {
  const [activeTab, setActiveTab] = useState<"details" | "inspection">("details");
  const TypeIcon = typeIcon(system.systemType);
  const wDays = system.warrantyExpiry ? daysUntilInventoryDate(system.warrantyExpiry) : null;

  const rows: [string, string][] = [
    ["System ID", system.systemId],
    ["System Name", system.systemName],
    ["Type", system.systemType || "—"],
    ["Category", system.systemCategory || "—"],
    ["Department", system.department],
    ["Location", system.location],
    ["Assigned User", system.assignedUser],
    ["Brand", system.brand || "—"],
    ["Model", system.model || "—"],
    ["Serial Number", system.serialNumber || "—"],
    ["Purchase Date", system.purchaseDate ? formatInventoryDate(system.purchaseDate) : "—"],
    ["Warranty Expiry", system.warrantyExpiry ? formatInventoryDate(system.warrantyExpiry) : "—"],
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <TypeIcon size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{system.systemName || "System Details"}</h2>
              <p className="text-xs text-slate-500 font-mono">{system.systemId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab("details")} className={`text-xs font-semibold px-3 py-1 rounded-lg ${activeTab === "details" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}>Details</button>
                <button onClick={() => setActiveTab("inspection")} className={`text-xs font-semibold px-3 py-1 rounded-lg ${activeTab === "inspection" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}>Inspection</button>
              </div>
            </div>
          </div>

          {activeTab === "details" && (
            <div className="space-y-5">
              <SystemStatusBadge status={system.status} />
              <div className="space-y-3">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 text-xs border-b border-slate-100 pb-2.5">
                    <span className="font-semibold text-slate-400 uppercase tracking-wide shrink-0">{label}</span>
                    <span className="text-slate-700 text-right font-medium">{value}</span>
                  </div>
                ))}
                {wDays !== null && (
                  <div className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg inline-block ${wDays < 0 ? "bg-red-50 text-red-600" : wDays < 90 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {wDays < 0 ? "Warranty expired" : `${wDays} days of warranty remaining`}
                  </div>
                )}
              </div>

              {system.pmSettings && (
                <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarClock size={14} className="text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-900">Preventive Maintenance Settings</h3>
                  </div>
                  {[
                    ["Frequency", system.pmSettings.frequency],
                    ["Priority", system.pmSettings.priority],
                    ["Last Maintenance", system.pmSettings.lastMaintenance ? formatDate(system.pmSettings.lastMaintenance) : "—"],
                    ["Next Due", system.pmSettings.nextDue ? formatDate(system.pmSettings.nextDue) : "—"],
                    ["Assigned Maintenance User", system.pmSettings.assignedUser || "—"],
                    ["Reminder", system.pmSettings.reminder || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                  {system.pmSettings.description && (
                    <p className="text-xs text-slate-600 pt-1.5 border-t border-blue-100 mt-1.5">{system.pmSettings.description}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "inspection" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div />
                {onOpenComplete && (
                  <button onClick={onOpenComplete} className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">Complete Inspection</button>
                )}
              </div>

              <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarClock size={14} className="text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">Inspection</h3>
                </div>
                {/* Pull active inspection if available */}
                {(() => {
                  const active = getActiveInspections().find(i => i.systemId === system.systemId);
                  const completedCount = getCompletedInspections().filter(c => c.systemId === system.systemId).length;
                  const frequency = active?.frequency ?? system.inspectionSettings?.frequency ?? (system.systemCategory === "GxP" ? "Monthly" : "Quarterly");
                  const reminder = active?.reminder ?? system.inspectionSettings?.reminder ?? "—";
                  const last = active?.originalDueDate ?? system.inspectionSettings?.lastInspection ?? "—";
                  const nextDue = active?.nextDueDate ?? system.inspectionSettings?.nextInspection ?? "—";
                  const status = active?.status ?? "—";
                  const nextReminder = active?.reminderDate ?? "—";
                  const priority = active?.priority ?? system.inspectionSettings?.priority ?? "—";

                  return (
                    <>
                      {[
                        ["Inspection Frequency", frequency],
                        ["Reminder", reminder],
                        ["Last Inspection Date", last ? (last === "—" ? "—" : formatDate(last)) : "—"],
                        ["Current Due Date", nextDue ? (nextDue === "—" ? "—" : formatDate(nextDue)) : "—"],
                        ["Next Scheduled Due", active?.scheduledNextDue ?? (system.inspectionSettings?.nextInspection ?? "—")],
                        ["Next Reminder", nextReminder ? (nextReminder === "—" ? "—" : formatDate(nextReminder)) : "—"],
                        ["Priority", priority],
                        ["Completed Count", String(completedCount)],
                        ["Current Status", status],
                        ["Recurrence ID", active?.recurrenceId ?? "—"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-semibold text-slate-800 text-right ml-4">{value}</span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
            Close
          </button>
          <button onClick={onEdit} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Edit2 size={14} /> Edit System
          </button>
        </div>
      </div>
    </div>
  );
}
