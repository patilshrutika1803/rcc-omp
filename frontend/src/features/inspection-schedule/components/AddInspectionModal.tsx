import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { SystemInventory } from "../../system-inventory/types/system";
import type {
  InspectionFrequency,
  InspectionPriority,
  InspectionReminderOption,
  InspectionScheduleRecord,
  InspectionTargetType,
} from "../types/inspectionSchedule";
import {
  INSPECTION_FREQUENCIES,
  INSPECTION_PRIORITIES,
  INSPECTION_REMINDERS,
  INSPECTION_TARGET_TYPES,
} from "../constants/inspectionScheduleConstants";
import { getFrequencyForCategory } from "../utils/inspectionScheduleUtils";
import { DEPARTMENT_OPTIONS } from "../../../constants/departments";

interface AddInspectionModalProps {
  onClose: () => void;
  onSave: (record: InspectionScheduleRecord) => void;
  systems: SystemInventory[];
  editRecord?: InspectionScheduleRecord;
}

export function AddInspectionModal({ onClose, onSave, systems, editRecord }: AddInspectionModalProps) {
  const [targetType, setTargetType] = useState<InspectionTargetType>(editRecord?.targetType ?? "System");
  const [systemId, setSystemId] = useState(editRecord?.systemId ?? systems[0]?.systemId ?? "");
  const [machineId, setMachineId] = useState(editRecord?.machineId ?? "");
  const [machineName, setMachineName] = useState(editRecord?.machineName ?? "");
  const [machineType, setMachineType] = useState(editRecord?.machineType ?? "");
  const [location, setLocation] = useState(editRecord?.location ?? "");
  const [department, setDepartment] = useState(editRecord?.department ?? DEPARTMENT_OPTIONS[0]);
  const [assignedUser, setAssignedUser] = useState(editRecord?.assignedUser ?? "");
  const [description, setDescription] = useState(editRecord?.description ?? "");
  const [frequency, setFrequency] = useState<InspectionFrequency>(editRecord?.frequency ?? "Monthly");
  const [dueDate, setDueDate] = useState(editRecord?.dueDate ?? new Date().toISOString().slice(0, 10));
  const [dueTime, setDueTime] = useState(editRecord?.dueTime ?? "17:00");
  const [reminderOption, setReminderOption] = useState<InspectionReminderOption>(editRecord?.reminderOption ?? "1 Day Before");
  const [priority, setPriority] = useState<InspectionPriority>(editRecord?.priority ?? "Medium");

  const selectedSystem = useMemo(
    () => systems.find((system) => system.systemId === systemId),
    [systems, systemId]
  );

  useEffect(() => {
    if (targetType === "System" && systems.length > 0 && !systemId) {
      setSystemId(systems[0].systemId);
    }
  }, [targetType, systems, systemId]);

  // Only set default frequency when creating NEW inspections (editRecord is undefined)
  // When editing, preserve the user-selected frequency
  useEffect(() => {
    if (editRecord) {
      // Editing mode: keep existing frequency
      return;
    }
    // Creating new inspection: set default frequency based on target type
    if (targetType === "Machine") {
      setFrequency("Monthly");
    } else if (targetType === "System" && selectedSystem) {
      setFrequency(getFrequencyForCategory(selectedSystem.systemCategory === "GxP" ? "GxP" : "Non-GxP"));
    }
  }, [targetType, selectedSystem, editRecord]);

  const handleSave = () => {
    const now = new Date().toISOString();

    let category: "GxP" | "Non-GxP" | "Machine" = "Machine";
    let systemSnapshot = undefined;
    let resolvedSystemId = undefined;
    let resolvedDepartment = department;
    let resolvedAssignedUser = assignedUser;

    if (targetType === "System") {
      if (!selectedSystem) return;
      category = selectedSystem.systemCategory === "GxP" ? "GxP" : "Non-GxP";
      resolvedSystemId = selectedSystem.systemId;
      systemSnapshot = {
        systemName: selectedSystem.systemName,
        systemType: selectedSystem.systemType,
        systemCategory: category,
        department: selectedSystem.department,
        assignedUser: selectedSystem.assignedUser,
      };
      resolvedDepartment = selectedSystem.department;
      resolvedAssignedUser = selectedSystem.assignedUser;
    }

    const record: InspectionScheduleRecord = {
      id: editRecord?.id ?? `insp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      targetType,
      systemId: resolvedSystemId,
      systemSnapshot,
      machineId: targetType === "Machine" ? machineId : undefined,
      machineName: targetType === "Machine" ? machineName : undefined,
      machineType: targetType === "Machine" ? machineType : undefined,
      location: targetType === "Machine" ? location : undefined,
      department: resolvedDepartment ?? "",
      assignedUser: resolvedAssignedUser ?? "",
      description: description || (targetType === "System" ? `Recurring ${category} system inspection` : "Machine inspection"),
      category,
      frequency: frequency,
      lastInspectionDate: editRecord?.lastInspectionDate ?? dueDate,
      dueDate,
      dueTime,
      reminderOption,
      reminderDate: dueDate,
      reminderTime: dueTime,
      priority,
      status: editRecord?.status ?? "Upcoming",
      recurrenceId: editRecord?.recurrenceId ?? `recur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      parentId: editRecord?.parentId,
      completionDate: editRecord?.completionDate,
      completionTime: editRecord?.completionTime,
      completedBy: editRecord?.completedBy,
      completionNotes: editRecord?.completionNotes,
      history: editRecord?.history ?? [],
      createdAt: editRecord?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{editRecord ? "Edit Inspection" : "Add Inspection"}</h2>
            <p className="text-xs text-slate-500">Create or update an inspection schedule record.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Target Type</label>
              <select value={targetType} onChange={(e) => setTargetType(e.target.value as InspectionTargetType)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {INSPECTION_TARGET_TYPES.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>

            {targetType === "System" ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">System</label>
                <select value={systemId} onChange={(e) => setSystemId(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                  {systems.map((system) => (
                    <option key={system.systemId} value={system.systemId}>
                      {system.systemId} · {system.systemName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Machine Name</label>
                  <input type="text" value={machineName} onChange={(e) => setMachineName(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Machine ID</label>
                  <input type="text" value={machineId} onChange={(e) => setMachineId(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
                </div>
              </>
            )}
          </div>

          {targetType === "Machine" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Machine Type</label>
                <input type="text" value={machineType} onChange={(e) => setMachineType(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                  {DEPARTMENT_OPTIONS.map((option: string) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Assigned User</label>
              <input type="text" value={assignedUser} onChange={(e) => setAssignedUser(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as InspectionPriority)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {INSPECTION_PRIORITIES.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as InspectionFrequency)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {INSPECTION_FREQUENCIES.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Due Time</label>
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Reminder</label>
              <select value={reminderOption} onChange={(e) => setReminderOption(e.target.value as InspectionReminderOption)} className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm focus:border-blue-500 focus:ring-blue-500/20">
                {INSPECTION_REMINDERS.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.2em]">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-3 border border-slate-300 rounded-3xl text-sm focus:border-blue-500 focus:ring-blue-500/20" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}
