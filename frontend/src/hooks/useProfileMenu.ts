import { useState } from "react";

/**
 * Owns the top-header profile dropdown open/close state.
 * Extracted verbatim (state only) from the former DashboardApp component in App.tsx.
 */
export function useProfileMenu() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const close = () => setIsProfileMenuOpen(false);
  const toggle = () => setIsProfileMenuOpen(o => !o);
  return { isProfileMenuOpen, setIsProfileMenuOpen, close, toggle };
}
