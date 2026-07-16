// ─────────────────────────────────────────────────────────────────────────────
// DepartmentPage
// Refactored from the original monolithic DepartmentsPage.tsx.
// UI, Tailwind classes, spacing, responsiveness, icons, navigation and
// functionality are UNCHANGED. This file now only assembles components and
// delegates all state/business logic to useDepartments().
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { LayoutDashboard, ChevronRight, Layers, Plus, Trash2 } from "lucide-react";

import { useDepartments } from "./hooks/useDepartments";
import type { Department, DepartmentFormSubmission, DeptTab } from "./types/department";
import { DEPARTMENT_TABS } from "./constants/departmentConfig";

import DepartmentFormModal from "./components/DepartmentFormModal";
import DepartmentDirectory from "./components/DepartmentDirectory";
import DepartmentCalendar from "./components/DepartmentCalendar";

export default function DepartmentPage() {
  const {
    departments,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments();

  const [activeTab, setActiveTab] = useState<DeptTab>("directory");
  const [showForm, setShowForm] = useState<"add" | "edit" | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  const handleAdd = () => {
    setEditingDept(null);
    setShowForm("add");
  };

  const handleEdit = (d: Department) => {
    setEditingDept(d);
    setShowForm("edit");
  };

  const handleDeleteRequest = (d: Department) => setDeletingDept(d);

  const handleSave = async (data: DepartmentFormSubmission) => {
    if (showForm === "add") {
      await createDepartment(data);
    } else if (showForm === "edit" && editingDept) {
      await updateDepartment(editingDept.id, data);
    }
    setShowForm(null);
    setEditingDept(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDept) return;
    await deleteDepartment(deletingDept);
    setDeletingDept(null);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {showForm && (
        <DepartmentFormModal
          mode={showForm}
          initial={editingDept ?? undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(null);
            setEditingDept(null);
          }}
        />
      )}

      {deletingDept && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeletingDept(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Department</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <div className="text-xs font-bold text-slate-900">{deletingDept.name}</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {deletingDept.id} · Head: {deletingDept.head}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingDept(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <LayoutDashboard size={12} />
          <span>Dashboard</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Departments</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Departments</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage organizational units and performance · {departments.length} departments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={14} /> Add Department
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5 overflow-hidden">
        <div className="flex overflow-x-auto">
          {DEPARTMENT_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                  isActive ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="animate-in fade-in duration-200">
        {activeTab === "directory" && (
          <DepartmentDirectory records={departments} onEdit={handleEdit} onDelete={handleDeleteRequest} />
        )}
        {activeTab === "calendar" && <DepartmentCalendar events={[]} />}
      </div>
    </div>
  );
}
