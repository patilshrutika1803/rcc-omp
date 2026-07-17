import React, { useState } from "react";
import { AlarmClock, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import type { PMRecord } from "../types/pm";
import { formatDate, addDays } from "../utils/pmDateUtils";
import { SNOOZE_OPTIONS } from "../constants/pmConstants";

export function SnoozeDialog({ record, onClose, onSnooze }: { record: PMRecord; onClose: () => void; onSnooze: (newDate: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");

  const options = SNOOZE_OPTIONS.map(opt => ({
    label: opt.label,
    sublabel: formatDate(addDays(record.nextDue, opt.days)),
    value: opt.value,
  }));

  const handleApply = () => {
    let newDate = "";
    const match = SNOOZE_OPTIONS.find(o => o.value === selected);
    if (match) newDate = addDays(record.nextDue, match.days);
    else if (selected === "custom" && customDate) newDate = customDate;

    if (!newDate) {
      toast.error("Please select a snooze option or pick a custom date.");
      return;
    }
    onSnooze(newDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
            <AlarmClock size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Snooze Maintenance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Postpone the due date for <span className="font-semibold text-slate-700">{record.machine}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selected === opt.value
                  ? "border-amber-400 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`text-sm font-bold ${selected === opt.value ? "text-amber-700" : "text-slate-900"}`}>{opt.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{opt.sublabel}</div>
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5 block">
            <CalendarIcon size={12} /> Custom Date
          </label>
          <input
            type="date"
            value={customDate}
            onChange={e => { setCustomDate(e.target.value); setSelected("custom"); }}
            className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleApply} className="flex-1 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
            <AlarmClock size={14} /> Apply Snooze
          </button>
        </div>
      </div>
    </div>
  );
}

export default SnoozeDialog;
