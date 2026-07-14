- [x] Create auth core (`frontend/src/auth/auth.ts`)
- [x] Create auth context provider (`frontend/src/auth/AuthProvider.tsx`)
- [x] Create protected route guard (`frontend/src/auth/ProtectedRoute.tsx`)
- [x] Create dedicated login page (`frontend/src/pages/LoginPage.tsx`)
- [x] Add `frontend/tsconfig.json` to enable TS/React typing
- [x] Fix TypeScript build issues in `PreventiveMaintenancePage.tsx` (minimal, no UI changes)
- [x] Refactor `frontend/src/app/App.tsx` to use React Router + ProtectedRoute
- [x] Verify `/` -> `/login`, successful login -> `/dashboard`
- [x] Verify refresh preserves auth session
- [x] Verify logout clears auth + prevents back navigation to protected pages
- [x] Verify each protected module redirects to `/login` when unauthenticated
- [x] Verify deployed Vercel behavior is identical


