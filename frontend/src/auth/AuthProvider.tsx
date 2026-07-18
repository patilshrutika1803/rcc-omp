import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthState, AuthUser } from "./auth";
import { getAuthState, loginWithPassword, logout as logoutStorage, setAuthState } from "./auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    setAuth(getAuthState());
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user: auth?.user ?? null,
      // Derive authentication from the provider's `auth` state so UI
      // responds immediately when `setAuth(null)` is called.
      isAuthenticated: ready ? auth !== null : false,
      ready,
      login: async (email: string, password: string) => {
        const state = await loginWithPassword(email, password);
        setAuthState(state);
        setAuth(state);
      },
      logout: () => {
        logoutStorage();
        try {
          sessionStorage.clear();
        } catch {
          // ignore
        }
        setAuth(null);
      },
      updateUser: (updates: Partial<AuthUser>) => {
        if (!auth) return;
        const nextState = {
          ...auth,
          user: {
            ...auth.user,
            ...updates,
          },
        };
        setAuthState(nextState);
        setAuth(nextState);
      },
    };
  }, [auth, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

