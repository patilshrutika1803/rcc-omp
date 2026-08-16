// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// Extracted verbatim from the former DashboardApp component in App.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

export function Footer() {
  return (
    <footer className="mt-2 pt-2 pb-1 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-400 gap-1">
      <div>© 2026 Rajaram Consumer Care Pvt. Ltd.</div>
      <div className="flex items-center gap-4">
        <span className="bg-slate-200/50 text-slate-500 px-2 py-0.5 rounded-md">Internal Use Only</span>
        <span>RCC OMP v7.0.0</span>
      </div>
    </footer>
  );
}

export default Footer;
