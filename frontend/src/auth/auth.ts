export type AuthUser = {
  email: string;
  name?: string;
  role?: string;
  department?: string;
  employeeId?: string;
  phone?: string;
  profileImageUrl?: string;
};

export type AuthState = {
  user: AuthUser;
  authenticatedAt: number;
};

const AUTH_STORAGE_KEY = "rccomp.auth";

export function getAuthState(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthState() !== null;
}

export function setAuthState(state: AuthState) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Temporary frontend-only login. Only allowed portal users are supported until backend integration.
// Later replace internals with: POST /api/auth/login (JWT etc.)
import { ALLOWED_USERS } from "./userDirectory";

export async function loginWithPassword(email: string, _password: string): Promise<AuthState> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = ALLOWED_USERS[normalizedEmail];
  if (!user) {
    throw new Error("Invalid email or password");
  }

  return {
    user: {
      email: normalizedEmail,
      name: user.name,
      role: user.role ?? "Portal User",
      department: user.department ?? "IT",
      employeeId: user.employeeId ?? "EMP-001",
      phone: user.phone ?? "+91 00000 00000",
      profileImageUrl: user.profileImageUrl,
    },
    authenticatedAt: Date.now(),
  };
}

