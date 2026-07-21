// ─────────────────────────────────────────────────────────────────────────────
// APP LAYOUT (application shell)
// Extracted verbatim from the former DashboardApp component in App.tsx.
// Renders: Sidebar, Header, Mobile Drawer, Main Content (AppRoutes +
// Global Search Overlay), Footer. Owns the shell-level state (active nav,
// sidebar collapse, mobile drawer, profile menu, search overlay).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";

import { loadPMState } from "../features/preventive-maintenance/utils/pmStorage";
import { buildPMGlobalSearchItems } from "../features/preventive-maintenance/utils/pmSearchIndex";

import { Sidebar } from "../layout/Sidebar";
import { Header } from "../layout/Header";
import { MobileDrawer } from "../layout/MobileDrawer";
import { Footer } from "../layout/Footer";
import { GlobalSearchOverlay } from "../components/GlobalSearch/GlobalSearchOverlay";

import { useSidebar } from "../hooks/useSidebar";
import { useProfileMenu } from "../hooks/useProfileMenu";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

import { AppRoutes, getNavIdFromPath, getRouteFromNavId } from "./AppRoutes";
import NotFoundPage from "../pages/NotFoundPage";

export function AppLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarCollapsed, setIsSidebarCollapsed, isMobileDrawerOpen, setIsMobileDrawerOpen } = useSidebar();
  const { isProfileMenuOpen, toggle: toggleProfileMenu, close: closeProfileMenu } = useProfileMenu();
  const { isSearchOpen, setIsSearchOpen } = useGlobalSearch();

  const activeNav = getNavIdFromPath(location.pathname);

  // PM records are persisted locally; global search should index them.
  // This is computed once per app-load.
  const pmExtraItems = useMemo(() => {
    const state = loadPMState();
    return buildPMGlobalSearchItems(state.records);
  }, []);



  // Unknown path inside the authenticated shell → show NotFound

  if (activeNav === null) {
    return <NotFoundPage />;
  }

  const handleNavigate = (nav: string) => {
    navigate(getRouteFromNavId(nav), { replace: false });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden w-full">
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        activeNav={activeNav}
        setActiveNav={handleNavigate}
        onLogout={onLogout}
      />

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeNav={activeNav}
        setActiveNav={handleNavigate}
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
          setActiveNav={handleNavigate}
          onLogout={onLogout}
        />

        {/* CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8 flex flex-col">
            <AppRoutes activeNav={activeNav} />

            {isSearchOpen && (
              <GlobalSearchOverlay
                onClose={() => setIsSearchOpen(false)}
                onNavigate={handleNavigate}
                extraItems={pmExtraItems}
              />
            )}


            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
