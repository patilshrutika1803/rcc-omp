export type AllowedUserData = {
  name: string;
  role?: string;
  department?: string;
  employeeId?: string;
  phone?: string;
  profileImageUrl?: string;
};

export const ALLOWED_USERS: Record<string, AllowedUserData> = {
  "nikhil.sakat@rajaram.com": {
    name: "Nikhil Sakat",
    role: "Operations Manager",
    department: "Operations",
    employeeId: "EMP-2048",
    phone: "+91 98765 43210",
  },
  "megha.jadhav@rajaram.com": {
    name: "Megha Jadhav",
    role: "IT Admin",
    department: "IT",
    employeeId: "EMP-1189",
    phone: "+91 98234 56789",
  },
  "kiran.yadav@rajaram.com": {
    name: "Kiran Yadav",
    role: "Maintenance Lead",
    department: "Maintenance",
    employeeId: "EMP-3021",
    phone: "+91 97654 32109",
  },
};

export const ALLOWED_USER_NAMES = Object.values(ALLOWED_USERS).map((user) => user.name);
