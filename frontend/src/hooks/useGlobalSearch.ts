import { useEffect, useState } from "react";

/**
 * Owns the global search overlay open state and the Cmd/Ctrl+K and Escape
 * keyboard shortcuts. Extracted verbatim from the former DashboardApp
 * component's keydown effect in App.tsx.
 */
export function useGlobalSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setIsSearchOpen(o => !o); }
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return { isSearchOpen, setIsSearchOpen };
}
