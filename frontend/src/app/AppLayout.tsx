// ─────────────────────────────────────────────────────────────────────────────
// APP LAYOUT (application shell)
// Extracted verbatim from the former DashboardApp component in App.tsx.
// Renders: Sidebar, Header, Mobile Drawer, Main Content (AppRoutes +
// Global Search Overlay), Footer. Owns the shell-level state (active nav,
// sidebar collapse, mobile drawer, profile menu, search overlay).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";

import { Sidebar } from "../layout/Sidebar";
import { Header } from "../layout/Header";
import { MobileDrawer } from "../layout/MobileDrawer";
import { Footer } from "../layout/Footer";
import { GlobalSearchOverlay } from "../components/GlobalSearch/GlobalSearchOverlay";

import { useSidebar } from "../hooks/useSidebar";
import { useProfileMenu } from "../hooks/useProfileMenu";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

import { AppRoutes } from "./AppRoutes";

export function AppLayout({
  onLogout,
  initialRoutePath,
}: {
  onLogout: () => void;
  initialRoutePath?: string;
}) {
  const { isSidebarCollapsed, setIsSidebarCollapsed, isMobileDrawerOpen, setIsMobileDrawerOpen } = useSidebar();
  const { isProfileMenuOpen, toggle: toggleProfileMenu, close: closeProfileMenu } = useProfileMenu();
  const { isSearchOpen, setIsSearchOpen } = useGlobalSearch();

  const [activeNav, setActiveNav] = useState(() => {
    const path = initialRoutePath ?? "";
    if (path.startsWith("/preventive-maintenance")) return "maintenance";
    if (path.startsWith("/backup-activities")) return "backup";
    if (path.startsWith("/qa-activities")) return "qa";
    if (path.startsWith("/system-inventory")) return "machines";
    if (path.startsWith("/departments")) return "departments";
    if (path.startsWith("/reports")) return "reports";
    if (path.startsWith("/notifications")) return "notifications";
    if (path.startsWith("/notes")) return "notes";
    if (path.startsWith("/settings")) return "settings";
    return "dashboard";
  });

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden w-full">
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onLogout={onLogout}
      />

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          isProfileMenuOpen={isProfileMenuOpen}
          onToggleProfileMenu={toggleProfileMenu}
          onCloseProfileMenu={closeProfileMenu}
          setActiveNav={setActiveNav}
          onLogout={onLogout}
        />

        {/* CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8 flex flex-col">
            <AppRoutes activeNav={activeNav} />

            {isSearchOpen && <GlobalSearchOverlay onClose={() => setIsSearchOpen(false)} onNavigate={(nav) => setActiveNav(nav)} />}

            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
