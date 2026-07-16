// ─────────────────────────────────────────────────────────────────────────────
// useDepartments.ts
//
// Centralizes all department state and business logic so DepartmentPage.tsx
// stays a pure UI-assembly component. Talks only to departmentService.ts —
// never imports Supabase/AWS directly.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as departmentService from "../services/departmentService";
import type {
  Department,
  DepartmentFormSubmission,
  Employee,
} from "../types/department";

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof departmentService.getDepartmentDashboard>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const stats = await departmentService.getDepartmentDashboard();
      setDashboard(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  }, []);

  useEffect(() => {
    loadDepartments();
    loadDashboard();
  }, [loadDepartments, loadDashboard]);

  const selectDepartment = useCallback(async (dept: Department | null) => {
    setSelectedDepartment(dept);
    if (dept) {
      try {
        const emps = await departmentService.getDepartmentEmployees(dept.name);
        setEmployees(emps);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load department employees");
      }
    }
  }, []);

  const createDepartment = useCallback(async (data: DepartmentFormSubmission) => {
    try {
      const newDept = await departmentService.createDepartment(data);
      setDepartments(prev => [...prev, newDept]);
      toast.success(`Department "${newDept.name}" created successfully.`);
      return newDept;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create department");
      throw err;
    }
  }, []);

  const updateDepartment = useCallback(
    async (id: string, data: Partial<DepartmentFormSubmission>) => {
      try {
        const updated = await departmentService.updateDepartment(id, data);
        if (updated) {
          setDepartments(prev => prev.map(d => (d.id === id ? updated : d)));
        }
        toast.success("Department updated successfully.");
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update department");
        throw err;
      }
    },
    []
  );

  const deleteDepartment = useCallback(async (dept: Department) => {
    try {
      await departmentService.deleteDepartment(dept.id);
      setDepartments(prev => prev.filter(d => d.id !== dept.id));
      toast.success(`Department "${dept.name}" deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete department");
      throw err;
    }
  }, []);

  return {
    departments,
    selectedDepartment,
    employees,
    dashboard,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    selectDepartment,
    reloadDepartments: loadDepartments,
  };
}
