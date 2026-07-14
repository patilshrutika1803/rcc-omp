import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }


  return children;
}

