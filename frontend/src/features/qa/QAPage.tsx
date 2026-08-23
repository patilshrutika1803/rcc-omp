// ─────────────────────────────────────────────────────────────────────────────
// QAPage
// QA Activities module — converted to an operational workflow aligned with
// the Backup Activities architecture.
// ─────────────────────────────────────────────────────────────────────────────

import {
  CheckSquare,
  Plus,
  Search,
  SlidersHorizontal,
  Table2,
  Grid3x3,
  Calendar as CalendarIcon,
  RefreshCw,
  ListFilter,
} from "lucide-react";
import { useQA } from "./hooks/useQA";
import { QAActivityTable } from "./components/QAActivityTable";
import { QAActivityCardView } from "./components/QAActivityCardView";
import { QACalendarView } from "./components/QACalendarView";
import { QAActivityDrawer } from "./components/QAActivityDrawer";
import { NewQAActivityModal } from "./components/NewQAActivityModal";
import { EditQAActivityModal } from "./components/EditQAActivityModal";
import { DEFAULT_FILTERS, DEPARTMENTS, PRIORITY_OPTIONS, REMINDER_OPTIONS } from "./constants/qaConstants";

const viewToggleOptions = [
  { id: "table", icon: Table2, title: "Table View" },
  { id: "card", icon: Grid3x3, title: "Card View" },
  { id: "calendar", icon: CalendarIcon, title: "Calendar View" },
] as const;

export default function QAPage() {
  const {
    viewMode, setViewMode,
    filteredActivities,
    search, setSearch,
    selectedRecord, showDrawer, setShowDrawer,
    showNew, setShowNew, newForm, setNewForm,
    showFilters, setShowFilters, showColumns, setShowColumns, filters, setFilters, columns, setColumns,
    openRecord, closeDrawer, handleCreate, handleUpdateRecord, handleEdit, handleComplete, handleDuplicate, handleDelete,
    editingRecord, setEditingRecord, openMenuId, setOpenMenuId,
  } = useQA();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[1600px] flex-col animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <CheckSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">QA Activities</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage quality activities and follow-ups</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /> Add QA Activity
            </button>
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 ml-1">
              {viewToggleOptions.map((view) => {
                const Icon = view.icon;
                return (
                  <button key={view.id} title={view.title} onClick={() => setViewMode(view.id as typeof viewMode)} className={`p-1.5 rounded-md transition-all ${viewMode === view.id ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-700"}`}>
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search QMS number or type" className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" />
          </div>
          <button onClick={() => setShowFilters((value) => !value)} className={`ml-auto flex items-center gap-1.5 h-9 px-3 text-xs font-semibold border rounded-lg transition-colors ${showFilters ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}>
            <SlidersHorizontal size={14} /> Filters
            {(filters.status || filters.priority || filters.reminder) && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" />}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-5 mt-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2"><ListFilter size={14} className="text-blue-500" /> Advanced Filters</h3>
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"><RefreshCw size={12} /> Reset</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
                <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700">
                  <option value="">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Priority</label>
                <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700">
                  <option value="">All Priorities</option>
                  {PRIORITY_OPTIONS.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Reminder</label>
                <select value={filters.reminder} onChange={(event) => setFilters((current) => ({ ...current, reminder: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700">
                  <option value="">All Reminders</option>
                  {REMINDER_OPTIONS.map((reminder) => <option key={reminder} value={reminder}>{reminder}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Department</label>
                <select value={filters.department} onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))} className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700">
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex-1">
        {viewMode === "table" ? (
          <QAActivityTable
            filteredActivities={filteredActivities}
            showColumns={showColumns}
            setShowColumns={setShowColumns}
            columns={columns}
            setColumns={setColumns}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onView={openRecord}
            handleDuplicate={handleDuplicate}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        ) : viewMode === "card" ? (
          <QAActivityCardView activities={filteredActivities} onView={openRecord} onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={handleDelete} />
        ) : (
          <QACalendarView activities={filteredActivities} onSelect={openRecord} />
        )}
      </div>

      {showNew && <NewQAActivityModal newForm={newForm} setNewForm={setNewForm} onClose={() => setShowNew(false)} onCreate={handleCreate} />}
      {editingRecord && (
        <EditQAActivityModal
          activity={editingRecord}
          onClose={() => {
            setShowDrawer(false);
            setEditingRecord(null);
          }}
          onSave={(updated) => {
            handleUpdateRecord(updated);
          }}
        />
      )}
      {showDrawer && selectedRecord && (
        <QAActivityDrawer
          record={selectedRecord}
          onClose={closeDrawer}
          onUpdate={handleUpdateRecord}
          onEdit={() => handleEdit(selectedRecord)}
          onComplete={(note, completedBy) => handleComplete(selectedRecord, note, completedBy)}
          onDuplicate={() => handleDuplicate(selectedRecord)}
          onDelete={() => handleDelete(selectedRecord.id)}
        />
      )}
    </div>
  );
}
