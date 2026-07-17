// ─────────────────────────────────────────────────────────────────────────────
// QAPage
// QA Activities module — production-ready frontend, prepared for future
// AWS backend / Supabase (DB + Auth) / S3 integration via REST APIs.
// Styling and structural patterns preserved from the original implementation.
// ─────────────────────────────────────────────────────────────────────────────

import {
  LayoutDashboard,
  CheckSquare,
  ChevronRight,
  Plus,
  Download,
  Loader2,
} from "lucide-react";
import { QA_SUB_TABS } from "./constants/qaConstants";
import { useQA } from "./hooks/useQA";
import { QADashboard } from "./components/QADashboard";
import { QAActivityTable } from "./components/QAActivityTable";
import { QAActivityDrawer } from "./components/QAActivityDrawer";
import { NewQAActivityModal } from "./components/NewQAActivityModal";

export default function QAPage() {
  const {
    subTab, setSubTab,
    filteredActivities,
    search, setSearch,
    selectedRecord, setSelectedRecord,
    isLoading, openMenuId, setOpenMenuId,
    showNew, setShowNew, newForm, setNewForm,
    showFilters, setShowFilters, showColumns, setShowColumns, filters, setFilters, columns, setColumns,
    totalCount, pendingCount, completedCount, overdueCount, upcomingCount,
    trendData, departmentBreakdown,
    handleUpdateRecord, handleCreate, handleDelete, handleDuplicate, handleGlobalExport,
  } = useQA();

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">QA Activities</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <CheckSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quality Assurance</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage QA activities across all departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={14} /> New QA Activity
            </button>
            <button onClick={handleGlobalExport} className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={14} /> Export Word
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-5 flex items-center gap-1 border-b border-slate-200 overflow-x-auto hide-scrollbar">
          {QA_SUB_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${
                subTab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Tab Content */}
      {subTab === "dashboard" && (
        <QADashboard
          totalCount={totalCount}
          pendingCount={pendingCount}
          completedCount={completedCount}
          overdueCount={overdueCount}
          upcomingCount={upcomingCount}
          trendData={trendData}
          departmentBreakdown={departmentBreakdown}
        />
      )}

      {subTab === "activities" && (
        <QAActivityTable
          filteredActivities={filteredActivities}
          search={search}
          setSearch={setSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filters={filters}
          setFilters={setFilters}
          showColumns={showColumns}
          setShowColumns={setShowColumns}
          columns={columns}
          setColumns={setColumns}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          setSelectedRecord={setSelectedRecord}
          handleGlobalExport={handleGlobalExport}
          handleDuplicate={handleDuplicate}
          handleDelete={handleDelete}
        />
      )}

      {/* New QA Activity Modal */}
      {showNew && (
        <NewQAActivityModal
          newForm={newForm}
          setNewForm={setNewForm}
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}

      {selectedRecord && <QAActivityDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} onUpdate={handleUpdateRecord} />}
    </div>
  );
}
