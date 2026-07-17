export type AuthUser = {
  email: string;
  name?: string;
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

// Temporary frontend-only login.
// Later replace internals with: POST /api/auth/login (JWT etc.)
export async function loginWithPassword(email: string, password: string): Promise<AuthState> {
  const ok = email === "nikhil.sakat@rajaram.com" && password === "admin123";
  if (!ok) {
    throw new Error("Invalid email or password");
  }

  return {
    user: { email, name: "Nikhil Sakat" },
    authenticatedAt: Date.now(),
  };
}

