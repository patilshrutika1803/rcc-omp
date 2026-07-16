// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE
// Re-exports the existing auth-flow ProtectedRoute so app/AppRoutes and
// app/App.tsx can import it from the app/ folder per the target architecture,
// without duplicating or changing the authentication logic in src/auth.
// ─────────────────────────────────────────────────────────────────────────────

export { ProtectedRoute } from "../auth/ProtectedRoute";
