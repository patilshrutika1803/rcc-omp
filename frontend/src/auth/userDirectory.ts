import { DEPARTMENT_OPTIONS } from "../constants/departments";

export type AllowedUserData = {
  name: string;
  role?: string;
  department?: string;
  employeeId?: string;
  phone?: string;
  profileImageUrl?: string;
};

export const USER_ROLE_OPTIONS = [
  "Operations Manager",
  "Maintenance Lead",
  "IT Admin",
] as const;

export type UserRole = (typeof USER_ROLE_OPTIONS)[number];

export function normalizeUserRole(value?: string | null): UserRole {
  const candidate = value?.trim();
  if (!candidate) return USER_ROLE_OPTIONS[0];

  const match = USER_ROLE_OPTIONS.find(
    (option) => option.toLowerCase() === candidate.toLowerCase()
  );

  return match ?? USER_ROLE_OPTIONS[0];
}

export function normalizeUserDepartment(value?: string | null): string {
  const candidate = value?.trim();
  if (!candidate) return DEPARTMENT_OPTIONS[0];

  const match = DEPARTMENT_OPTIONS.find(
    (option) => option.toLowerCase() === candidate.toLowerCase()
  );

  return match ?? DEPARTMENT_OPTIONS[0];
}

export const ALLOWED_USERS: Record<string, AllowedUserData> = {
  "nikhil.sakat@rajaram.com": {
    name: "Nikhil Sakat",
    role: "Operations Manager",
    department: "Production",
    employeeId: "EMP-2048",
    phone: "+91 98765 43210",
  },
  "megha.jadhav@rajaram.com": {
    name: "Megha Jadhav",
    role: "IT Admin",
    department: "IT Department",
    employeeId: "EMP-1189",
    phone: "+91 98234 56789",
  },
  "kiran.yadav@rajaram.com": {
    name: "Kiran Yadav",
    role: "Maintenance Lead",
    department: "Engineering",
    employeeId: "EMP-3021",
    phone: "+91 97654 32109",
  },
};

export const ALLOWED_USER_NAMES = Object.values(ALLOWED_USERS).map((user) => user.name);
