import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthState, AuthUser } from "./auth";
import { getAuthState, isAuthenticated, loginWithPassword, logout as logoutStorage, setAuthState } from "./auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
      isAuthenticated: ready ? isAuthenticated() : false,
      ready,
      login: async (email: string, password: string) => {
        const state = await loginWithPassword(email, password);
        setAuthState(state);
        setAuth(state);
      },
      logout: () => {
        logoutStorage();
        setAuth(null);
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

