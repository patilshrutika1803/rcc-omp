// ─────────────────────────────────────────────────────────────────────────────
// departmentService.ts
//
// This is the ONLY file in the departments feature that will ever talk to a
// backend. Every other file (components, hooks, page) is backend-agnostic and
// consumes this service's functions/types only.
//
// Current state: all functions return empty arrays / placeholder objects that
// satisfy the feature's TypeScript interfaces. No mock/demo data, no network
// calls.
//
// Future state: swap the function bodies below for real Supabase client calls
// (e.g. `supabase.from('departments').select('*')`) and, if needed, calls to
// an AWS-hosted backend (e.g. via fetch/axios to an API Gateway/Lambda
// endpoint, or S3 for file storage). Because every consumer only imports the
// function signatures below, none of them need to change when this happens.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Department,
  DepartmentDashboardStats,
  DepartmentFormSubmission,
  DepartmentKPI,
  DepartmentActivity,
  Employee,
} from "../types/department";

/**
 * Fetch all departments.
 * Future: `const { data, error } = await supabase.from('departments').select('*')`
 */
export async function getDepartments(): Promise<Department[]> {
  return [];
}

/**
 * Fetch a single department by id.
 * Future: `.select('*').eq('id', id).single()`
 */
export async function getDepartmentById(_id: string): Promise<Department | null> {
  return null;
}

/**
 * Create a new department.
 * Future: `.insert([...]).select().single()`
 */
export async function createDepartment(
  data: DepartmentFormSubmission
): Promise<Department> {
  const placeholder: Department = {
    id: "",
    name: data.name ?? "",
    head: data.head ?? "",
    manager: data.manager ?? "",
    location: data.location ?? "",
    employees: data.employees ?? 0,
    machines: 0,
    openPM: 0,
    openQA: 0,
    backupJobs: 0,
    performanceScore: 0,
    status: data.status ?? "Active",
    budget: 0,
    budgetUsed: 0,
    description: data.description ?? "",
    recentActivities: [],
    monthlyKPIs: [],
  };
  return placeholder;
}

/**
 * Update an existing department.
 * Future: `.update({...}).eq('id', id).select().single()`
 */
export async function updateDepartment(
  id: string,
  data: Partial<DepartmentFormSubmission>
): Promise<Department | null> {
  return null;
}

/**
 * Delete a department.
 * Future: `.delete().eq('id', id)`
 */
export async function deleteDepartment(_id: string): Promise<void> {
  return;
}

/**
 * Fetch employees belonging to a department.
 * Future: `.from('employees').select('*').eq('department', departmentName)`
 */
export async function getDepartmentEmployees(_departmentName: string): Promise<Employee[]> {
  return [];
}

/**
 * Fetch aggregate dashboard stats for all departments.
 * Future: could be a Postgres view/RPC call via Supabase, or an AWS Lambda
 * aggregation endpoint.
 */
export async function getDepartmentDashboard(): Promise<DepartmentDashboardStats> {
  return {
    totalDepartments: 0,
    activeDepartments: 0,
    totalEmployees: 0,
    activeMachines: 0,
    openTasks: 0,
    avgPerformance: 0,
  };
}

/**
 * Fetch monthly KPIs for a specific department.
 */
export async function getDepartmentKPIs(_departmentId: string): Promise<DepartmentKPI[]> {
  return [];
}

/**
 * Fetch recent activity feed for a specific department.
 */
export async function getDepartmentActivities(_departmentId: string): Promise<DepartmentActivity[]> {
  return [];
}
