// ─────────────────────────────────────────────────────────────────────────────
// App.tsx — Application entry point for RCC OMP
// (Rajaram Consumer Care Operations Management Portal)
//
// Responsibilities (and ONLY these):
//  - Initialize providers (AuthProvider, BrowserRouter, Toaster)
//  - Handle the authentication wrapper (ProtectedRoute)
//  - Render the app shell (AppLayout) and top-level react-router routes
//
// All navigation constants, search data, global search overlay, sidebar,
// header, footer, mobile drawer, profile dropdown, user profile, role
// management and help center screens have been extracted into
// layout/, components/GlobalSearch/, modules/, constants/ and hooks/.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router";
import { Toaster } from "sonner";

import { AppLayout } from "./AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import RegisterPage from "../pages/RegisterPage";

import { AuthProvider } from "../auth/AuthProvider";
import { logout as logoutAuth } from "../auth/auth";

import PreventiveMaintenancePage from "../features/preventive-maintenance/pages/PreventiveMaintenancePage";
import BackupActivitiesPage from "../features/backup/pages/BackupActivitiesPage";
import QAPage from "../features/qa/pages/QAPage";
import SystemInventoryPage from "../features/system-inventory/pages/SystemInventoryPage";
import DepartmentsPage from "../features/departments/pages/DepartmentsPage";

import NotificationsPage from "../features/notificataions/pages/NotificationsPage";
import NotesPage from "../features/notes/pages/NotesPage";
import SettingsPage from "../features/settings/pages/SettingsPage";

function LogoutAndRedirect({ closeProfileDropdown }: { closeProfileDropdown?: () => void }) {
  const navigate = useNavigate();

  const onLogout = () => {
    logoutAuth();
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }

    closeProfileDropdown?.();
    navigate("/login", { replace: true });
  };

  const location = useLocation();

  return (
    <AppLayout
      onLogout={onLogout}
      initialRoutePath={location.pathname}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LogoutAndRedirect />
              </ProtectedRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/preventive-maintenance"
            element={
              <ProtectedRoute>
                <PreventiveMaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backup-activities"
            element={
              <ProtectedRoute>
                <BackupActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa-activities"
            element={
              <ProtectedRoute>
                <QAPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-inventory"
            element={
              <ProtectedRoute>
                <SystemInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <DepartmentsPage />
              </ProtectedRoute>
            }
          />


          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
