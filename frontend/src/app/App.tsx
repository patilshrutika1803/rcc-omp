// ─────────────────────────────────────────────────────────────────────────────
// App.tsx — Application entry point for RCC OMP
// (Rajaram Consumer Care Operations Management Portal)
//
// Responsibilities (and ONLY these):
//  - Initialize providers (AuthProvider, BrowserRouter, Toaster)
//  - Handle the authentication wrapper (ProtectedRoute/PublicRoute)
//  - Render the app shell (AppLayout) and top-level react-router routes
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router";
import { Toaster } from "sonner";

import { AppLayout } from "./AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";

import { AuthProvider, useAuth } from "../auth/AuthProvider";

function RootRedirect() {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Navigate to="/dashboard" replace />;
}

function AppShell({ closeProfileDropdown }: { closeProfileDropdown?: () => void }) {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const onLogout = () => {
    // Use the AuthProvider logout so provider state is updated.
    logout();
    closeProfileDropdown?.();
    navigate("/login", { replace: true });
  };

  return <AppLayout onLogout={onLogout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/preventive-maintenance" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/backup-activities" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/qa-activities" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/system-inventory" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
