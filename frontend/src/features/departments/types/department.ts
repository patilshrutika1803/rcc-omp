// ─────────────────────────────────────────────────────────────────────────────
// Department feature — type definitions
// Extracted from the original monolithic DepartmentsPage.tsx.
// No behavior changes — types only.
// ─────────────────────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  employeeId: string;
  workload: number;
  assignedMachines: number;
  availability: "Available" | "Busy" | "On Leave" | "Remote";
  status: "Active" | "On Leave" | "Inactive";
  initials: string;
  avatarColor: string;
}

export type DepartmentStatus = "Active" | "Under Review" | "Restructuring";

export interface DepartmentActivity {
  time: string;
  action: string;
  by: string;
}

export interface DepartmentKPI {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
}

export interface Department {
  id: string;
  name: string;
  head: string;
  manager: string;
  location: string;
  employees: number;
  machines: number;
  openPM: number;
  openQA: number;
  backupJobs: number;
  performanceScore: number;
  status: DepartmentStatus;
  budget: number;
  budgetUsed: number;
  description: string;
  recentActivities: DepartmentActivity[];
  monthlyKPIs: DepartmentKPI[];
}

// Alias kept for compatibility with the original internal name (DeptRecord)
export type DeptRecord = Department;

export interface DepartmentForm {
  name: string;
  head: string;
  manager: string;
  location: string;
  employees: number;
  status: DepartmentStatus;
  description: string;
}

export interface DepartmentFormSubmission extends Partial<Department> {
  assignedUsers: string[];
}

export interface DepartmentDashboardStats {
  totalDepartments: number;
  activeDepartments: number;
  totalEmployees: number;
  activeMachines: number;
  openTasks: number;
  avgPerformance: number;
}

export interface DepartmentMonthlyPerf {
  month: string;
  production: number;
  it: number;
  warehouse: number;
  utilities: number;
  qa: number;
}

export interface DepartmentTaskDistribution {
  name: string;
  pm: number;
  qa: number;
  backup: number;
}

export interface DepartmentReview {
  dept: string;
  date: string;
  type: string;
  reviewer: string;
}

export interface DepartmentAnalyticsMonthly {
  month: string;
  taskCompletion: number;
  machineUtil: number;
  backupSuccess: number;
  qaPass: number;
}

export interface DepartmentCalendarEvent {
  date: string;
  title: string;
  type: string;
  dept: string;
  color: string;
}

export interface DepartmentReport {
  id: string;
  title: string;
  dept: string;
  type: string;
  date: string;
  size: string;
  pages: number;
  status: string;
}

export interface ResourceConflict {
  date: string;
  user: string;
  conflict: string;
  dept: string;
  severity: string;
}

export type DeptTab = "directory" | "calendar";
