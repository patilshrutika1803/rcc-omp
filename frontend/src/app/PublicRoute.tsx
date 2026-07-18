import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../auth/AuthProvider";

export function PublicRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (isAuthenticated) {
    // If the user was redirected here from a protected route, send them back.
    const from = (location.state as { from?: string } | undefined)?.from;
    const fallback = from && from.startsWith("/") ? from : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
