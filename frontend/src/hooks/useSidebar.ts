import { useEffect, useState } from "react";

/**
 * Owns desktop sidebar collapse state and mobile drawer open state.
 * Extracted verbatim from the former DashboardApp component in App.tsx
 * (state + the window-resize effect that auto-closes the mobile drawer
 * on larger viewports).
 */
export function useSidebar() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMobileDrawerOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
  };
}
