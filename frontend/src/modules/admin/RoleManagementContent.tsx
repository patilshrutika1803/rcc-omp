import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Edit2,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../auth/AuthProvider";
import { ALLOWED_USERS, normalizeUserDepartment, normalizeUserRole, USER_ROLE_OPTIONS } from "../../auth/userDirectory";
import { DEPARTMENT_OPTIONS } from "../../constants/departments";
import { StatusChip } from "../../shared/components/EnterpriseUI";

const USER_STORAGE_KEY = "rccomp.user.management.users";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  employeeId: string;
  phone: string;
  status: "Active" | "Inactive";
};

type UserFormState = {
  name: string;
  email: string;
  role: string;
  department: string;
  employeeId: string;
  phone: string;
};

function buildDefaultUsers(): ManagedUser[] {
  return Object.entries(ALLOWED_USERS).map(([email, user]) => ({
    id: email,
    name: user.name,
    email,
    role: normalizeUserRole(user.role),
    department: normalizeUserDepartment(user.department),
    employeeId: user.employeeId ?? `EMP-${Math.random().toString().slice(2, 6)}`,
    phone: user.phone ?? "+91 00000 00000",
    status: "Active",
  }));
}

function makeUserId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return buildDefaultUsers();

    const parsed = JSON.parse(raw) as ManagedUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) return buildDefaultUsers();

    const seeded = buildDefaultUsers();
    const merged = [...seeded];

    parsed.forEach((record) => {
      const mergedIndex = merged.findIndex((item) => item.email.toLowerCase() === record.email.toLowerCase());
      if (mergedIndex >= 0) {
        merged[mergedIndex] = {
          ...merged[mergedIndex],
          ...record,
          id: record.id || merged[mergedIndex].id,
          name: record.name?.trim() || merged[mergedIndex].name,
          email: record.email?.trim() || merged[mergedIndex].email,
          role: normalizeUserRole(record.role),
          department: normalizeUserDepartment(record.department),
          employeeId: record.employeeId?.trim() || merged[mergedIndex].employeeId,
          phone: record.phone?.trim() || merged[mergedIndex].phone,
          status: record.status === "Inactive" ? "Inactive" : "Active",
        };
      } else {
        merged.push({
          ...record,
          id: record.id || makeUserId(),
          name: record.name?.trim() || "New User",
          email: record.email?.trim() || `${makeUserId()}@example.com`,
          role: normalizeUserRole(record.role),
          department: normalizeUserDepartment(record.department),
          employeeId: record.employeeId?.trim() || "EMP-0000",
          phone: record.phone?.trim() || "+91 00000 00000",
          status: record.status === "Inactive" ? "Inactive" : "Active",
        });
      }
    });

    return merged;
  } catch {
    return buildDefaultUsers();
  }
}

function writeUsers(users: ManagedUser[]) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

export function RoleManagementContent() {
  const { user, updateUser } = useAuth();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>(() => readUsers());
  const [form, setForm] = useState<UserFormState>({
    name: "",
    email: "",
    role: USER_ROLE_OPTIONS[0],
    department: DEPARTMENT_OPTIONS[0],
    employeeId: "",
    phone: "",
  });

  useEffect(() => {
    writeUsers(users);
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((candidate) =>
      [candidate.name, candidate.email, candidate.role, candidate.department, candidate.employeeId, candidate.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, users]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      role: USER_ROLE_OPTIONS[0],
      department: DEPARTMENT_OPTIONS[0],
      employeeId: "",
      phone: "",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (candidate: ManagedUser) => {
    setEditingId(candidate.id);
    setForm({
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      department: candidate.department,
      employeeId: candidate.employeeId,
      phone: candidate.phone,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    const nextName = form.name.trim();
    const nextEmail = form.email.trim().toLowerCase();
    const nextRole = normalizeUserRole(form.role);
    const nextDepartment = normalizeUserDepartment(form.department);
    const nextEmployeeId = form.employeeId.trim();
    const nextPhone = form.phone.trim();

    if (!nextName || !nextEmail || !nextEmployeeId) {
      toast.error("Name, email and employee ID are required.");
      return;
    }

    const emailExists = users.some(
      (candidate) => candidate.email.toLowerCase() === nextEmail && candidate.id !== editingId
    );

    if (emailExists) {
      toast.error("Another user already uses this email.");
      return;
    }

    const nextRecord: ManagedUser = {
      id: editingId ?? makeUserId(),
      name: nextName,
      email: nextEmail,
      role: nextRole,
      department: nextDepartment,
      employeeId: nextEmployeeId,
      phone: nextPhone || "+91 00000 00000",
      status: editingId ? users.find((candidate) => candidate.id === editingId)?.status ?? "Active" : "Active",
    };

    setUsers((current) => {
      if (editingId) {
        return current.map((candidate) => (candidate.id === editingId ? nextRecord : candidate));
      }
      return [nextRecord, ...current];
    });

    if (user?.email?.toLowerCase() === nextEmail.toLowerCase()) {
      updateUser({
        name: nextName,
        role: nextRole,
        department: nextDepartment,
        employeeId: nextEmployeeId,
        phone: nextPhone || "+91 00000 00000",
      });
    }

    setIsFormOpen(false);
    setEditingId(null);
    toast.success(editingId ? "User updated" : "User added");
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find((candidate) => candidate.id === id);
    if (!target) return;

    setUsers((current) => current.filter((candidate) => candidate.id !== id));

    if (user?.email?.toLowerCase() === target.email.toLowerCase()) {
      toast.warning("You cannot remove the currently signed-in account from this list.");
      setUsers((current) => (current.some((candidate) => candidate.email.toLowerCase() === target.email.toLowerCase()) ? current : [target, ...current]));
      return;
    }

    toast.success("User deleted");
  };

  const handleToggleStatus = (id: string) => {
    setUsers((current) =>
      current.map((candidate) => {
        if (candidate.id !== id) return candidate;

        const nextStatus = candidate.status === "Active" ? "Inactive" : "Active";
        if (user?.email?.toLowerCase() === candidate.email.toLowerCase()) {
          toast.info("Your own session remains active; only this record was updated.");
        }
        return { ...candidate, status: nextStatus };
      })
    );
    toast.success("User status updated");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
          <Settings size={12} />
          <span>Settings</span>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">User Management</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">{users.length} users · {USER_ROLE_OPTIONS.length} roles</p>
            </div>
          </div>
          <button onClick={openCreateForm} className="flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={13} /> Add User
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Employee ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-xs text-slate-400">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {candidate.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((segment) => segment[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{candidate.name}</div>
                        <div className="text-[10px] text-slate-400">{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{candidate.role}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{candidate.department}</td>
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{candidate.employeeId}</td>
                  <td className="px-4 py-3.5">
                    <StatusChip
                      label={candidate.status}
                      variant={candidate.status === "Active" ? "success" : "neutral"}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditForm(candidate)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        aria-label={`Edit ${candidate.name}`}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(candidate.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        aria-label={`Toggle status for ${candidate.name}`}
                      >
                        <UserX size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(candidate.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        aria-label={`Delete ${candidate.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit User" : "Add User"}</h2>
                <p className="text-xs text-slate-500">Use the existing user structure and approved department list.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                >
                  {USER_ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
                <select
                  value={form.department}
                  onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                >
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Employee ID</label>
                <input
                  value={form.employeeId}
                  onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-blue-500/20 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsFormOpen(false)}
                className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={13} />
                {editingId ? "Save Changes" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagementContent;
