# RCC-OMP — Complete System Audit

Prepared as a read-only audit. No code was modified. All findings are drawn from the actual repository (`RCC-OMP.zip`), not assumed.

---

## PART 1 — System Overview

**What the application currently does**
RCC-OMP is a React + TypeScript + Vite single-page application. It's a frontend-only build right now — there is no functioning backend. The repo has empty `backend/` and `database/` folders (placeholders only), and a root `README.md` that describes a *planned* architecture (AWS Lambda + API Gateway + Supabase Postgres + S3), none of which exists in code yet.

Every module — Preventive Maintenance, Backup Activities, QA, Monthly Hard Disk Tracker, System Inventory, Inspection Schedule, Notifications, Notes, Settings — reads and writes its data straight to the browser's `localStorage`, wrapped in small per-module "service" or "storage" files that already have `TODO` comments marking exactly where a real API call will go later (e.g. `// TODO: GET /api/pm-records`). This is good practice for an incremental build, but it means the app today is fundamentally a **single-browser prototype**, not a multi-user system, regardless of how many people log in.

**Authentication architecture**
There is no Supabase integration yet. Login is a hardcoded lookup: `auth/userDirectory.ts` contains a fixed dictionary of 3 emails → user profile objects. `auth/auth.ts`'s `loginWithPassword()` checks only that the email exists in that dictionary — **the password parameter is accepted but never validated** (`_password` is unused). Session state is a plain object (`{ user, authenticatedAt }`) written to `localStorage` under the key `rccomp.auth`. There is no token, no expiry, no server round-trip.

**Current data persistence architecture**
Flat `localStorage` keys, one per module, global to the browser (not scoped per logged-in user, with one exception — Notes, see Part 4). Examples: `rcc_omp_pm_state_v1`, `rcc_omp_qa_activities`, `rcc_omp_backup_jobs_v1`, `rcc_omp_notifications`, `rcc_omp_system_inventory`, `rcc_omp_inspection_schedule_v1`, `rcc_omp_monthly_hard_disk_cycles_v1`, `rcc_omp_notes_v1` (per-user keyed inside one JSON blob), `rccomp.settings.general`, `rccomp.settings.notifications`.

**Routing architecture**
`react-router` (`BrowserRouter`) drives real URLs (`/dashboard`, `/preventive-maintenance`, etc.), each wrapped in a single generic `ProtectedRoute` that only checks "is *someone* logged in" — there is no per-route role check anywhere. Inside the authenticated shell, `AppRoutes.tsx` does a second, redundant switch from `activeNav` (derived from the URL) to the actual page component. `/user-management` (Role & Admin) is reachable and fully functional-looking to **any** authenticated user, including "Maintenance Lead," even though the in-app Role & Permission matrix claims only "IT Head" can manage users.

**Main components / structure**
- `app/` — App shell, routing, layout composition.
- `auth/` — login/session logic, temporary user directory.
- `features/<module>/` — one folder per domain module, each with its own `hooks/`, `services/`, `types/`, `utils/`, `components/`, and (mostly) `constants/`. This is a clean, consistent feature-folder pattern.
- `layout/` — Sidebar, Header, MobileDrawer, Footer, ProfileDropdown.
- `modules/admin`, `modules/help`, `modules/profile` — three pages that sit outside the `features/` convention (inconsistent placement — see Part 13).
- `components/GlobalSearch/` — a single cross-module search overlay.
- `app/components/ui/` — the full shadcn/Radix UI primitive library (buttons, dialogs, tables, etc.) — this is the actual design-system layer.

**Important services/hooks**
Every module follows the same shape: a `use<Module>()` hook owns all React state and orchestrates calls into a `xStorage.ts` or `xService.ts` file that talks to `localStorage`. This is a genuinely solid separation of concerns — swapping `localStorage` for real HTTP calls later should mostly mean rewriting the service files, not the hooks or components. That said, some hooks (`usePreventiveMaintenance.ts`) have grown very large and mix state, business rules, and side effects (toasts, reminders, history) in one file.

**Data models**
Each module defines its own TypeScript types under `features/<module>/types/`. There is **no shared/global `User` type used consistently** — `auth/auth.ts` defines `AuthUser`, but several modules re-invent "who did this" as a free-text `string` field (`completedBy`, `verifiedBy`, `doneBy`) instead of referencing the logged-in user. See Part 4 and Part 9 for the consequences.

**How modules communicate**
Mostly not at all — each module is siloed against its own storage key. The two exceptions:
1. PM records feed the Global Search index (`pmSearchIndex.ts`) and the Dashboard's Work Queue/Upcoming Deadlines.
2. PM, Backup, and QA modules generate entries into the shared Notifications store (`rcc_omp_notifications`).

**Where state is stored**
Entirely client-side: React state (in-memory, per session) hydrated from `localStorage` on mount, written back on every mutation. Nothing survives a browser data wipe or moves between devices/browsers.

**Mock/demo/static data found**
- `auth/userDirectory.ts` — 3 hardcoded users (intentional, per your brief, temporary).
- `modules/admin/RoleManagementContent.tsx` — a **second**, independent, hardcoded `EMPLOYEES` array with different emails/roles/departments than `userDirectory.ts` (see Part 5, Confirmed Bug).
- Five unused Dashboard component files (`MachineHealthAndProgress.tsx`, `TaskDistributionChart.tsx`, `WeeklyOverviewChart.tsx`, `RecentActivityCard.tsx`, `DashboardKPICards.tsx`) still exist in the repo but are **not imported anywhere** — dead code left over from an earlier, more "analytics-dashboard" version of the product that has since been correctly simplified. Good news: the live Dashboard today does *not* violate your "no fake KPIs/charts" rule. Bad news: the dead files are technical debt and a re-introduction risk.

**Duplicated logic**
- Two parallel "inspection" concepts exist: the dedicated **Inspection Schedule** module, and a second, separate inspection workflow embedded inside **System Inventory** (`CompleteInspectionDialog.tsx`, `InspectionKPISection.tsx`, `InspectionHistoryPanel.tsx` exist *inside* `features/system-inventory/` as well as inside `features/inspection-schedule/`, with their own separate storage keys `rcc_omp_system_inspections` vs `rcc_omp_inspection_schedule_v1`). This needs a product decision (Part 6/12).
- `app/ProtectedRoute.tsx` is a pure re-export of `auth/ProtectedRoute.tsx` — harmless but redundant, and a sign the app/features migration was left half-finished.

**Technical debt identified**
- `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` are installed as dependencies but **never imported anywhere in `src/`**. Pure dead weight in `node_modules`/bundle config.
- The `modules/admin/RoleManagementContent.tsx` file uses `any[]` for its data model — the one clear TypeScript-quality regression in an otherwise typed codebase.
- Several `// BUG N` comments already exist in `usePreventiveMaintenance.ts` (BUG 2, BUG 4, BUG 5) — these appear to be a previous developer's own annotations describing fixes *already applied* for known issues (duplicate reminder generation, duplicate-PM detection, completed-PM history). They are not necessarily open bugs, but they mark historically fragile logic that deserves regression-testing attention.

---

## PART 2 — Complete Module Map

| Module | Purpose | Main Files | Current Data Source | Main Actions | Current Status | Problems Found |
|---|---|---|---|---|---|---|
| Dashboard | Entry point: greeting, work queue, calendar, upcoming deadlines, personal notes, quick actions | `DashboardPage.tsx`, `hooks/useDashboard.ts`, `services/dashboardService.ts` | Derived/read from PM, Notes, and calendar logic (localStorage) | Add Backup/PM/QA/Note shortcuts, Export (browser print) | Live, matches "keep it simple" brief | Export Report is just `window.print()` (Part 5); 5 dead unused analytics components sit in the folder |
| Preventive Maintenance | Schedule, track, and complete recurring machine maintenance | `PreventiveMaintenancePage.tsx`, `hooks/usePreventiveMaintenance.ts`, `utils/pmStorage.ts`, `utils/pmDateUtils.ts` | `localStorage: rcc_omp_pm_state_v1` | Create, edit, delete, complete (with checklist), snooze, duplicate, recur | Most complete module | `completedBy` hardcoded to `"Current User"` string, not real session user (Part 4/9) |
| Backup Activities | Track scheduled backup jobs and verification | `BackupActivitiesPage.tsx`, `hooks/useBackupActivities.ts`, `utils/backupStorage.ts` | `localStorage: rcc_omp_backup_jobs_v1` | Create/run/duplicate/export job, record `doneBy`/`verifiedBy` | Functional, backend TODOs present | `doneBy`/`verifiedBy` are free-text inputs, not tied to the logged-in user |
| Monthly Hard Disk Tracker | Track monthly hard-disk swap/verification cycles | `MonthlyHardDiskTrackerPage.tsx`, `hooks/useMonthlyHardDiskTracker.ts`, `utils/hardDiskStorage.ts` | `localStorage: rcc_omp_monthly_hard_disk_cycles_v1` | Start cycle, mark completed, verify | Functional | Same free-text `completedBy`/`verifiedBy` pattern |
| QA Activities | Track quality-assurance department activities and target dates | `QAPage.tsx`, `hooks/useQA.ts`, `utils/qaStorage.ts`, `utils/qaValidation.ts` | `localStorage: rcc_omp_qa_activities` | Create/edit activity, mark complete, view trend/department charts | Functional; "In Progress" per README | `completedBy` input defaults to placeholder text `"Current User"`, is user-editable free text |
| System Inventory | Asset register: laptops, desktops, printers, department mapping | `SystemInventoryPage.tsx`, `hooks/useSystemInventory.ts`, `services/systemInventoryService.ts`, `services/systemInspectionService.ts` | `localStorage: rcc_omp_system_inventory`, `rcc_omp_system_inspections` | Add/edit/delete system, run "inspection" on a system | Backend-ready comments present, no mock data (good) | Contains its **own** inspection sub-workflow, overlapping with the dedicated Inspection Schedule module (Part 12) |
| Inspection Schedule | Standalone scheduled inspection module | `InspectionSchedulePage.tsx`, `hooks/useInspectionSchedule.ts`, `services/inspectionScheduleService.ts` | `localStorage: rcc_omp_inspection_schedule_v1` | Add inspection, complete with `completedBy`, view history | Functional | Duplicates concept/UI with System Inventory's inspection feature; unclear which is canonical |
| Notifications | Central alert feed (PM/Backup/QA reminders and system events) | `NotificationsPage.tsx`, `hooks/useNotifications.ts`, `utils/notificationStorage.ts`, `services/notificationService.ts` | `localStorage: rcc_omp_notifications` | Mark read, delete, navigate to source record | Functional, correctly wired to PM at least | Since storage is global to the browser (not user-scoped), notifications are effectively "whoever's using this browser" not "this logged-in user's" notifications |
| Notes | Personal (and nominally "shared") notes | `pages/NotesPage.tsx`, `hooks/useNotes.ts`, `services/noteService.ts` | `localStorage: rcc_omp_notes_v1` (keyed per userId inside one JSON object) | Create/edit/pin/tag/share note | Functional, best-isolated module | `shared: true` flag exists but has **no effect** — a "shared" note is still stored only under the creating user's key and never becomes visible to anyone else (Part 5, Confirmed Bug) |
| User & Role Management | Intended admin screen for users/roles/permissions/access logs | `modules/admin/RoleManagementContent.tsx` | **Hardcoded** local `EMPLOYEES`/`ROLE_PERMS`/`ROLE_ASSIGNMENTS` arrays inside the component, `any[]` typed | Nominally: invite user, edit role, deactivate, view permission matrix, view access logs | Entirely decorative | Every action is fake (`toast.success("Invite sent!")`, Edit button does nothing, "Access Logs" tab is a permanently empty hardcoded array); user list here **doesn't match** `auth/userDirectory.ts` (different emails, different departments — see Part 5) |
| Settings | General app settings + notification preferences | `pages/SettingsPage.tsx`, `utils/generalSettings.ts`, `utils/notificationSettings.ts` | `localStorage: rccomp.settings.general`, `rccomp.settings.notifications` | Toggle preferences | Functional | Global to browser, not per-user — if two people share a workstation, one's settings changes affect the other |
| Help Center | Static documentation/help content | `modules/help/HelpCenterContent.tsx`, `modules/help/documentationData.ts` | Static in-code data | Browse docs | Functional/static by design | None found — appropriate for its purpose |
| Profile | View/edit the logged-in user's own profile | `modules/profile/UserProfileContent.tsx` | `AuthProvider` (localStorage `rccomp.auth`) | Edit name/phone/department/photo | Functional | Edits only affect the local session object — there's no real account system for changes to persist against |
| Login / Auth | Sign-in, forgot-password, register pages | `pages/LoginPage.tsx`, `pages/ForgotPasswordPage.tsx`, `pages/RegisterPage.tsx`, `auth/*` | Hardcoded `ALLOWED_USERS` dictionary | Login, "forgot password" (UI only), "register" (UI only, likely non-functional against real accounts) | Temporary, explicitly by design | Password is never checked (Part 8, High risk) |

---

## PART 3 — User / Role / Permission Model

**Current implementation**

- **Users:** A hardcoded dictionary of 3 emails in `auth/userDirectory.ts` (Nikhil Sakat, Megha Jadhav, Kiran Yadav). Note: this file's departments do **not** match your brief's "all three are IT Department" — the code has Nikhil as "Production," Megha as "IT Department," and Kiran as "Engineering." A **second, independent** hardcoded roster exists in `modules/admin/RoleManagementContent.tsx` with yet another, different set of role titles ("IT Head," "IT Executive") and only 2 of the 3 users represented, and different email addresses (`@rcc.com` vs `@rajaram.com`). These two lists are out of sync with each other and with your stated requirement.
- **Roles:** Free-text `role` string carried on the `AuthUser` object; no enum, no permission mapping tied to it anywhere in actual enforcement logic. The Role & Permission Matrix in the admin page is a static, disconnected mock — it does not gate anything.
- **Departments:** A shared `DEPARTMENT_OPTIONS` constant (`constants/departments.ts`) is used for normalization/validation across modules — this part is done reasonably well and consistently.
- **Login:** Email-only lookup against the hardcoded dictionary; **password is accepted but not validated at all**.
- **Profile:** Editable, but only writes back into the local session object (`AuthProvider.updateUser`), not to any persistent per-user record other users would see.
- **Permissions:** Not enforced anywhere in code. `ProtectedRoute` only checks "logged in," not "logged in AND allowed to see this page." Every authenticated user can reach every route, including `/user-management`.
- **Protected routes:** Present at the router level (redirect-to-login if unauthenticated) but with no per-role granularity.
- **User-specific data:** Only Notes are actually keyed per user. Everything else is global-to-browser.
- **Shared data:** Nothing is genuinely shared across users/devices today — "shared" currently just means "same browser, same localStorage."

**Gap vs. the intended future model (Supabase Auth + AWS EC2 backend + multiple shared users + RBAC + audit history)**

| Requirement | Current State | Gap |
|---|---|---|
| Supabase Authentication | None — local dictionary lookup, no password check | Full auth system needs to be built; current `AuthProvider` interface is a reasonable adapter point (its public API — `login`, `logout`, `user`, `isAuthenticated` — could largely stay the same shape) |
| Shared backend/data (AWS EC2) | None — pure `localStorage` | Every module's `xStorage.ts`/`xService.ts` needs real API calls; the TODO comments already mark most of these correctly |
| Role-based access control | Role is a display string only; no enforcement | Needs real permission checks, ideally centralized (e.g., a `usePermission()` hook + a route-level guard keyed by role), not the current single generic `ProtectedRoute` |
| Audit history | None (see Part 10) | Needs an actor+timestamp+action+entity event log with a real backend; today no action can be reliably attributed since "who did it" is manually typed |
| Multi-user shared state | None (see Part 4/9) | Needs real-time or at-least-on-refresh shared reads once the backend exists |

---

## PART 4 — Data Flow Audit

General pattern across **every** operational module (PM, Backup, QA, Hard Disk, Inventory, Inspection Schedule):

1. **Origin:** User fills a form in a modal/drawer.
2. **Storage:** Written to a single global `localStorage` key via the module's `xStorage.ts`/`xService.ts`.
3. **Read:** On mount, the module's hook calls `loadXState()`/`getX()`, synchronously reading `localStorage`.
4. **Create:** Appends to the in-memory array, then re-serializes and writes the whole array back.
5. **Edit:** Maps over the array, replaces the matching record by id, re-serializes and writes.
6. **Delete:** Filters the array, re-serializes and writes.
7. **Status changes:** Computed client-side from dates (e.g., PM's `daysUntil()` → Overdue/Due Today/Upcoming) or set directly by user action (Complete/Snooze).
8. **User-specific or shared?** Global to the browser (i.e., **not** even properly single-user-specific — anyone using that browser sees and can modify everyone's "shared" data), **except** Notes, which are correctly keyed by `userId` inside the store.
9. **Will this work correctly for multiple users?** No. Because storage lives in one person's browser, User B on their own machine will never see anything User A does, and vice versa — the exact failure mode your brief calls out.
10. **Backend integration needed:** Yes, for every module — each `xStorage.ts`/`xService.ts` is the correct, already-identified seam to replace with real HTTP calls.

**Places where "User A changes something but User B would NOT see it" — confirmed for every module below, because each keeps its data in one browser's `localStorage` with no server round-trip:**

- Preventive Maintenance — task creation, completion, snooze, duplicate.
- Backup Activities — job creation, run/verify status.
- QA Activities — activity creation, completion, status.
- Monthly Hard Disk Tracker — cycle start/complete/verify.
- System Inventory — asset add/edit/delete, inspection completion.
- Inspection Schedule — inspection creation/completion.
- Notifications — since the store is global-to-browser rather than tied to a real account, "your" notifications are really "whoever is on this browser's" notifications; on a shared workstation this leaks between people.
- Settings — general/notification preferences are global to the browser, so on a shared machine, User B's settings change silently overwrites User A's.
- User & Role Management — entirely fake, so this is moot until it's rebuilt against something real.
- Notes — this is the one module that *is* correctly scoped **per logged-in user's identity** already (keyed by `employeeId`/`email`), but "Shared Notes" specifically do not actually share (see Part 5).

---

## PART 5 — Functional Bugs

**CONFIRMED BUG — "Shared Notes" don't share anything.**
`features/notes/services/noteService.ts` stores notes in a store keyed by `userId`. `shareNote(id, shared)` (and the `shared` field generally) only ever flips a boolean on a note that still lives under the *creator's* key. No other user's read path ever looks at another user's key. Marking a note "Shared" currently does nothing observable to anyone but the author. This is a genuine UX-breaking bug: the feature name promises cross-user visibility it cannot deliver on the current architecture.

**CONFIRMED BUG — Two independent, out-of-sync user rosters.**
`auth/userDirectory.ts` (real login data) and `modules/admin/RoleManagementContent.tsx` (`EMPLOYEES` array) list different emails, different departments, and different role titles for the same three people, and the admin list is missing Kiran Yadav entirely. Anyone visiting User & Role Management sees information that contradicts what's actually true of the logged-in accounts.

**CONFIRMED BUG — User & Role Management actions are non-functional.**
- "Invite User" → only shows a `toast.success("Invite sent!")`; no user is created anywhere.
- Row "Edit" (pencil icon) → has no `onClick` handler at all; a dead button.
- "Deactivate" (UserX icon) → only shows `toast.error("User deactivated.")`; no state changes, the row stays exactly the same on screen and in storage.
- "Access Logs" tab → `ACCESS_LOGS` is a hardcoded empty array; the tab can never show data no matter what happens elsewhere in the app.

**CONFIRMED BUG — No real route/role gating.**
Every authenticated user, regardless of role, can navigate directly to `/user-management` (and every other route) via the URL bar or sidebar. The in-app "Permission Matrix" implies "IT User" role shouldn't have Admin access, but nothing in the routing layer enforces that.

**CONFIRMED — "Export Report" on the Dashboard is `window.print()`.**
Not a bug exactly (it's a legitimate lightweight interim solution), but it will not produce a proper PDF/branded export and should be flagged as a placeholder, not a finished feature, if it's currently presented to users as "Export Report."

**CONFIRMED — Settings and Notifications are not user-scoped.**
On a shared workstation (plausible for an IT department kiosk-style machine), one user's notification-preference changes or read/dismissed notifications silently apply to the next person who opens the app on that machine, because these stores are global-to-browser, not per-user.

**POTENTIAL ISSUE — Duplicate PM-completion-cycle safety net.**
`handleCompletePM()` in `usePreventiveMaintenance.ts` includes logic (marked "BUG 4" in comments) to prevent creating a second active recurring PM in the same cycle, keyed by `recurrenceId` with a fallback to `machine + frequency` matching for older records. This is a reasonable safeguard but is entirely client-side and in-memory; if two people (in the eventual multi-user world) complete the same PM near-simultaneously on different browsers, this check cannot prevent a genuine duplicate, because there is no shared source of truth to check against.

**No evidence found of:** broken routes/404s in the defined route table, incorrect empty-state text, or dead buttons in the PM/Backup/QA/Hard Disk/Inspection/Notifications/Notes modules — CRUD wiring in those modules is consistent and complete as far as static code review can confirm. (A live click-through per Part 15 is still recommended to catch anything a static read can't, e.g. runtime exceptions.)

---

## PART 6 — Logic / Business Rule Audit

**PM due-date / status logic — appears correct.** `daysUntil()` in `pmDateUtils.ts` normalizes to midnight before comparing, avoiding the classic "time-of-day" off-by-one bug. Status derivation (`Overdue` if `d < 0`, `Due Today` if `d === 0`, else `Upcoming`) is applied consistently in both `handleCheckAll()` and `handleSnooze()`. **DESIGN DECISION THAT NEEDS CONFIRMATION:** status recalculation (`handleCheckAll`) is a manual/on-demand client action today, not automatic — a PM that becomes overdue while no one has the app open, or has not clicked "refresh," will show stale status until someone triggers a recalculation. Confirm whether this should become automatic (e.g., recompute on every load, or eventually a server-side scheduled job as the code's own TODO already anticipates).

**PM recurrence/completion — appears correct, but fragile.** On completion, a new recurring record is spawned with a fresh `recurrenceId`, and the completed one is archived into `completedPMs` + `completionHistory`. The in-code "BUG 2/4/5" comments indicate this exact area needed real debugging before (reminder duplication, false-positive duplicate detection, lost completion history) — this suggests it's the single most bug-prone area in the app and deserves priority regression testing whenever touched again.

**QA `completedBy` — DESIGN DECISION THAT NEEDS CONFIRMATION.** The completion form's input placeholder literally says `"Current User"`, and the fallback logic (`completedBy?.trim() || item.completedBy || "Current User"`) means if the field is left blank, the record is silently attributed to the literal string "Current User" rather than to anyone real. This should be tied to the logged-in session, not left as manual free text — same issue in Backup and Hard Disk Tracker.

**Backup / Hard Disk verification — CONFIRMED as design gap, not yet a "bug".** `verifiedBy` is a manual text field in both modules. There's no rule preventing the same person from being both `completedBy` and `verifiedBy` on the same record, which would defeat the purpose of a verification step if that's meant to be a second-person check. Confirm whether that separation-of-duties rule is actually required.

**Inspection Schedule vs. System Inventory inspections — POTENTIAL ISSUE.** Two separate modules implement what looks like the same underlying concept ("complete an inspection, record who did it and when") with separate storage, separate history panels, and separate KPI sections. This needs a product decision: are these genuinely two different kinds of inspection (e.g., asset health check vs. scheduled compliance inspection), or is this accidental duplication from iterative development? If they're meant to be different, the naming/UI should make that distinction obvious to a user; today it isn't.

---

## PART 7 — UI / UX Audit

**Layout & navigation:** Consistent shell (Sidebar + Header + Footer) across all authenticated routes; sidebar/mobile drawer state is centralized in dedicated hooks (`useSidebar`, `useProfileMenu`) — clean and consistent.

**Tables/forms/modals:** Each module follows a very consistent visual language (rounded-xl cards, slate color palette, consistent badge/status chip styling) — this reads as a deliberate, disciplined design system, not ad-hoc per-page styling. Good adherence to your "simple, professional, operational" brief.

**Empty states:** Present and reasonably worded in the modules reviewed (PM's `EmptyState.tsx`, Notifications' `EmptyNotifications.tsx`, Notes' `EmptyNotes.tsx`, System Inventory's `EmptyState.tsx`). The User & Role Management table's empty state ("No users available. Invite users to start managing access.") is misleading, since the underlying data is hardcoded and will never actually reflect "no users" or added users either.

**Loading states:** Only partially implemented. `LoadingSkeleton.tsx` exists for Preventive Maintenance specifically; Dashboard, Inspection Schedule, and System Inventory hooks reference `isLoading` state, but several modules (Backup, QA, Hard Disk, Notifications, Notes) show no dedicated loading-skeleton component. Since everything currently reads synchronously from `localStorage`, this is invisible today — but it will matter the moment real network calls are introduced, and should be designed for now rather than retrofitted later.

**Confirmation dialogs:** Present for destructive actions in the modules checked (PM's `DeleteDialog.tsx`, System Inventory's `DeleteConfirmDialog.tsx`). The admin page's "Deactivate" button, by contrast, has **no** confirmation step at all before firing its (currently fake) toast — worth fixing structurally now so the pattern is right once the action becomes real.

**Feedback/toasts:** `sonner` toasts are used consistently across modules for success/error feedback — good consistency.

**Accessibility / mobile responsiveness:** Not deeply auditable from static code alone; Tailwind responsive classes (`sm:`, `lg:`, `xl:`) are used throughout, and a dedicated `MobileDrawer.tsx` exists, suggesting responsiveness was a real design consideration. A live pass on an actual phone-sized viewport is recommended (see Part 15) — static review can't confirm real-world touch-target sizing or screen-reader labeling quality.

**Philosophy check (simple/professional/operational, not overdesigned):** Broadly met. The one clear violation of the *spirit* of this rule is the still-present (if unused) Dashboard analytics components (Machine Health, Task Distribution, Weekly Overview charts) — they should be deleted, not just left unwired, so a future contributor doesn't accidentally re-enable "fake KPI" dashboard clutter.

---

## PART 8 — Security Audit

**HIGH RISK**
- **Password is never validated.** `loginWithPassword(email, _password)` ignores the password entirely and grants a full session to anyone who submits any of the three known email addresses with any string as a password. This is effectively an unauthenticated system today, gated only by knowledge of a valid email address (which are guessable — `firstname.lastname@rajaram.com`).
- **No route-level authorization.** Any authenticated user can reach the Admin/User-Management route regardless of role, and nothing in the app enforces the permission matrix it visually displays.

**MEDIUM RISK**
- **Session has no expiry.** `rccomp.auth` in `localStorage` persists indefinitely until explicit logout; there's no timeout, so a session on a shared/kiosk machine stays "logged in" forever.
- **Actor attribution is self-reported, not authenticated.** Because `completedBy`/`verifiedBy`/`doneBy` fields are free-text inputs rather than derived from the session, any user can attribute an action to any name they type, including someone else's — this is both a data-integrity and an accountability problem, directly undermining the audit-trail goal in your brief.

**LOW RISK**
- **`window.print()` for "Export Report"** exposes only what's already visible on screen; not a security issue by itself, just a functional placeholder (see Part 5).
- **No CSRF/XSS-specific issues found** in the modules reviewed — content rendered from user input (notes, PM descriptions, etc.) appears to go through standard React text rendering, not raw HTML injection. The only `dangerouslySetInnerHTML` in the codebase is inside the shadcn `app/components/ui/chart.tsx` primitive, and it only injects CSS custom-property strings built from a typed `ChartConfig` object (chart color theming), not user-supplied text — not a real injection vector as used today.

**INFORMATIONAL**
- No hardcoded API keys, secrets, or credentials were found anywhere in the reviewed source (appropriate, since there's no backend integration yet).
- The `ALLOWED_USERS`/`EMPLOYEES` hardcoded rosters are visible to anyone who can read the deployed frontend bundle (as all frontend code always is) — this is expected/acceptable for a temporary, pre-backend dev build, but should not persist once Supabase Auth is wired in; it should be deleted at that point, not merely stop being called.
- `sessionStorage.clear()` on logout is a reasonable, mildly protective touch (clears any transient per-session flags on sign-out).
- The Help Center's documentation content (`modules/help/documentationData.ts`) already describes a "View Audit Log — Track user activities for compliance" feature under User & Role Management, and references "backup logs for auditing," "inventory reports for compliance and audits," etc. **None of this exists in working code today.** This is a documentation/reality mismatch that will confuse users who read the Help Center and then can't find the feature — flag for correction or for prioritizing the real build.

---

## PART 9 — Multi-User / Shared Data Audit

| Module | Currently Shared? | Current Storage | Multi-user Problem | Required Future Backend Behavior |
|---|---|---|---|---|
| Preventive Maintenance | No | `localStorage: rcc_omp_pm_state_v1` (global to browser) | User A completes a PM on their machine; User B, on their own machine, still sees it as due/overdue | Shared table (e.g., Postgres `pm_records`), read on load + refresh (or realtime) by all authorized users; completion writes should include the authenticated user's id server-side, not a client-supplied name |
| Backup Activities | No | `localStorage: rcc_omp_backup_jobs_v1` | User A runs/verifies a backup job; User B doesn't see the updated status or history | Shared `backup_jobs` table; `doneBy`/`verifiedBy` should be set server-side from the authenticated session, not typed |
| Monthly Hard Disk Tracker | No | `localStorage: rcc_omp_monthly_hard_disk_cycles_v1` | User A marks a monthly cycle complete/verified; User B's view is unaffected | Shared `hard_disk_cycles` table; same actor-attribution fix as above |
| QA Activities | No | `localStorage: rcc_omp_qa_activities` | User A changes a QA activity's status; User B sees stale status | Shared `qa_activities` table; server-set `completedBy` |
| System Inventory | No | `localStorage: rcc_omp_system_inventory`, `rcc_omp_system_inspections` | User A edits an asset record or logs an inspection; User B sees the old data | Shared `systems`/`system_inspections` tables |
| Inspection Schedule | No | `localStorage: rcc_omp_inspection_schedule_v1` | User A completes a scheduled inspection; User B still sees it as pending | Shared `inspections` table |
| Notifications | No (worse: leaks between whoever uses the same browser) | `localStorage: rcc_omp_notifications` | Not scoped to a real account at all today — "my notifications" is really "this browser's notifications" | Per-user notification rows (`user_id` foreign key), fetched only for the authenticated user; PM/QA/Backup completions by any user should generate notifications visible to the relevant other users, not just locally |
| Notes | Partially (per-browser, per-user-id key; "Shared" flag is currently non-functional) | `localStorage: rcc_omp_notes_v1` | "Shared Notes" claims cross-user visibility it can't deliver; private notes correctly stay siloed today only because they're all on the same browser | Personal notes stay private to the owning user's account server-side; a genuinely separate "shared" notes table/flag that other authorized users can actually query |
| Settings | No | `localStorage: rccomp.settings.general/notifications` | Settings changes by one person on a shared machine silently affect the next person | Settings should be tied to the authenticated user's account row, not the browser |
| User & Role Management | N/A (entirely mock) | None (hardcoded arrays) | Not real yet | Needs to be rebuilt against the real `users`/`roles` tables once Supabase Auth exists; today nothing here should be trusted as representative of real users |

**Illustrative examples confirmed true in the current code, matching your brief's exact scenarios:**
- User A completes PM → User B does **not** see completed status (confirmed: `rcc_omp_pm_state_v1` is local-only).
- User A creates a backup activity → User B does **not** see it (confirmed: `rcc_omp_backup_jobs_v1` is local-only).
- User A edits inventory → User B does **not** see updated inventory (confirmed: `rcc_omp_system_inventory` is local-only).
- User A changes QA status → User B does **not** see the new status (confirmed: `rcc_omp_qa_activities` is local-only).
- User A logs in → nothing is recorded anywhere; there is no login-event logging in the codebase at all (confirmed via full-repo search).

---

## PART 10 — Audit Log Requirements

**Existing logging today:** None that qualifies as a real audit trail. What exists instead:
- PM has an in-memory-only `timelineLog` (`addTimelineEntry`) that is **not persisted** to `localStorage` at all — it resets on every page reload — and every entry's `user` field is hardcoded to the literal string `"Current User"`, not the actual logged-in identity.
- PM and Backup have a per-record `history`/`completionHistory` array that *is* persisted, but again with a hardcoded/free-text actor rather than a real user id, and it only covers completion events, not every meaningful action.
- QA, Hard Disk Tracker, Inspection Schedule, System Inventory, Notes, Settings, and User Management have **no** history/audit tracking of any kind.
- There is no login/logout event log anywhere in the app.

**Required future audit entries:**

| Module | Action | Should Log? | What Should Be Recorded |
|---|---|---|---|
| Auth | Login | Yes | user id, timestamp, success/failure |
| Auth | Logout | Yes | user id, timestamp |
| Preventive Maintenance | Create / Edit / Delete / Complete / Snooze / Duplicate | Yes | user id, action, PM record id, machine, timestamp, resulting status |
| Backup Activities | Create / Run / Verify / Duplicate / Export | Yes | user id, action, job id, timestamp, resulting status |
| Monthly Hard Disk Tracker | Start cycle / Complete / Verify | Yes | user id, action, cycle id, timestamp, resulting status |
| QA Activities | Create / Edit / Complete / Status change | Yes | user id, action, activity id, timestamp, resulting status |
| System Inventory | Create / Edit / Delete asset / Complete inspection | Yes | user id, action, asset id, timestamp, field(s) changed where feasible |
| Inspection Schedule | Create / Complete inspection | Yes | user id, action, inspection id, timestamp, resulting status |
| Notifications | Mark read / Delete | Optional (low priority; volume may be high and value is limited) | If logged: user id, notification id, action, timestamp |
| Notes | Create / Edit / Delete / Share toggle | **Metadata only, never content** | user id, action, note id, timestamp — explicitly excluding `title`/`content` per your requirement |
| Settings | Preference change | Optional (low priority) | user id, setting key, timestamp — avoid logging full before/after values if any could be considered sensitive |
| User & Role Management | Invite / Edit role / Deactivate user | Yes (high priority — this is exactly the kind of action that needs accountability) | actor user id, target user id, action, timestamp |
| Any module | Export/download of data | Yes | user id, module, export type, timestamp |

**Design note:** every module above with `completedBy`/`verifiedBy`/`doneBy` free-text inputs should stop being free text once a real backend exists — those fields should be **derived from the authenticated session** and the free-text input either removed or repurposed as a "notes" field, so audit entries can be trusted rather than self-reported.

---

## PART 11 — Temporary Data / Mock Data Audit

| Item | Current Purpose | Should It Remain? | What Eventually Replaces It |
|---|---|---|---|
| `auth/userDirectory.ts` (`ALLOWED_USERS`) | Lets the 3 named people log in without a real backend | No — remove once Supabase Auth is wired in | Supabase `auth.users` + a `profiles`/`employees` table for role/department/employeeId |
| `modules/admin/RoleManagementContent.tsx` `EMPLOYEES` array | Fills the admin table with something to look at | No | A live query against the real users table |
| `modules/admin/RoleManagementContent.tsx` `ROLE_PERMS` / `ROLE_ASSIGNMENTS` / `ACCESS_LOGS` | Fills roles/matrix/logs tabs | `ROLE_PERMS` structure (module → permission list) is a reasonable *shape* to keep; the *values* and the empty `ACCESS_LOGS` are placeholders | A real roles/permissions table, and a real audit-log query (Part 10) |
| Five unused Dashboard components (`MachineHealthAndProgress.tsx`, `TaskDistributionChart.tsx`, `WeeklyOverviewChart.tsx`, `RecentActivityCard.tsx`, `DashboardKPICards.tsx`) | Leftover from an earlier, more analytics-heavy dashboard concept | No — not currently used and conflict with your "no fake KPIs/charts" rule; safe to delete since nothing imports them | Nothing — intentionally not replaced, per your brief |
| `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` (package.json dependencies) | Unknown — not used anywhere in `src/` | No | Nothing; Radix + Tailwind (already in use) covers the UI needs |
| `rcc_omp_*` localStorage keys (PM, Backup, QA, Hard Disk, Inventory, Inspection, Notifications, Notes) | Interim persistence while backend doesn't exist | Should remain **only** as a local dev/offline fallback if desired later, not as the system of record | Real backend tables (AWS EC2-hosted services / Supabase Postgres per your architecture) |
| `rccomp.settings.*` localStorage keys | Interim settings persistence | Same as above | Per-user settings row in the backend |
| ForgotPassword / Register pages' "backend not connected" messaging | Honest placeholder UI, functioning as designed | Yes, keep the pattern (clear "coming soon" messaging) until real | Real Supabase-backed flows |

No fake/demo *operational* data (e.g., fabricated machines, fabricated completed tasks) was found seeded anywhere — System Inventory explicitly starts empty by design, and the other modules similarly start from an empty array rather than pre-seeded records. This is good discipline and should be preserved.

---

## PART 12 — Cross-Module Consistency

**Date formatting:** Consistently uses `en-IN` locale formatting (`toLocaleDateString`) across the modules reviewed (PM's `formatDate`, Dashboard's date/time header) — good consistency.

**Status naming:** Mostly consistent (`Upcoming` / `Due Today` / `Overdue` / `Completed` pattern recurs across PM, Backup, Inspection Schedule) but **not identical everywhere** — worth a full enum-by-enum comparison across QA and Hard Disk Tracker's status sets during implementation, since they weren't confirmed to use the exact same four labels.

**Actor representation:** **Inconsistent, and this is the most consequential issue in the whole audit.** PM/QA/Backup/Hard Disk/Inspection Schedule all represent "who did this" differently — sometimes a hardcoded literal, sometimes a free-text input with a placeholder, never a reference to the actual logged-in user. This should be unified into one pattern (derive from `useAuth()`/session) across every module in the same implementation pass.

**Department representation:** Consistent — all modules pull from the shared `constants/departments.ts` `DEPARTMENT_OPTIONS` list via `normalizeDepartment()`-style helpers.

**Delete/confirmation behavior:** Mostly consistent (dedicated confirm dialogs in PM and System Inventory); the admin page's Deactivate button is the one confirmed exception (no confirmation step).

**Search/filter conventions:** PM's search+filter+sort pattern (`searchQuery`, `quickFilter`, `filters` object, persisted to storage) is well-built and could be a good template to standardize QA/Backup/Hard Disk Tracker against, if they don't already follow an identical shape (not fully confirmed for all four during this pass — recommend a direct side-by-side diff before writing implementation prompts for filter parity).

**Duplicate "inspection" concept:** As raised in Part 6, System Inventory and Inspection Schedule implement overlapping inspection workflows with separate storage and separate UI, which breaks the "same conventions everywhere" expectation a user would reasonably have.

---

## PART 13 — Technical Quality

**TypeScript quality:** Generally strong and consistent — most modules define proper `types/*.ts` files and use them throughout. The one clear regression is `modules/admin/RoleManagementContent.tsx`, which uses `any[]`/`any` for its (currently mock) data instead of a typed model.

**React patterns:** Consistent feature-hook pattern (`use<Module>()` owns state, delegates I/O to a service/storage file) across nearly every module — this is a maintainable, backend-swap-friendly architecture. `usePreventiveMaintenance.ts` has grown large and mixes several concerns (CRUD, reminders, timeline, filters) in one file; consider splitting before adding more logic to it.

**Component structure / reuse:** Good — shared UI primitives live in `app/components/ui/` (shadcn/Radix-based), and feature-specific badges/cards are consistently broken into their own files (`StatusBadge.tsx`, `PriorityBadge.tsx`, etc.) rather than inlined repeatedly.

**Folder placement inconsistency:** `modules/admin`, `modules/help`, `modules/profile` sit outside the otherwise-consistent `features/<name>/` convention used by every other domain area — worth normalizing (either move them into `features/`, or intentionally define `modules/` as "cross-cutting, non-CRUD pages" and document that distinction).

**Duplicate code:** The System Inventory / Inspection Schedule overlap (Part 6/12) is the clearest instance of duplicated logic and components.

**Unused code:** The five dead Dashboard components (Part 11) and the unused MUI/Emotion dependencies are the two clearest examples.

**Dependency issues:** `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` installed but unused anywhere in `src/` — safe removal candidates, pending confirmation nothing external (e.g., a build script) depends on them.

**Build/console errors:** A full TypeScript project check could not be completed in this environment (missing `vite/client` type entry point in this sandbox's `node_modules` state — an environment/setup issue here, not a confirmed in-repo defect) — **recommend running `pnpm install && pnpm run build` in your own environment** and sharing the output before this is treated as clean or broken; do not assume either outcome from this audit alone.

---

## PART 14 — Priority List

**P0 — Critical / blocks system**
1. Password is never validated at login (Part 8) — anyone with a known email can log in as that person.
2. No real backend / all modules are single-browser localStorage (Part 1, 4, 9) — blocks the entire multi-user requirement; this is the central, expected, known limitation your brief already anticipates and is planning to resolve via Supabase + AWS.
3. No route/role-based access control — any user can reach Admin (Part 3, 8).

**P1 — High priority**
4. Actor attribution (`completedBy`/`verifiedBy`/`doneBy`) is free text everywhere, not derived from the session — breaks the audit-trail requirement at its root (Part 4, 6, 9, 10).
5. User & Role Management page is entirely non-functional and shows data inconsistent with real login data (Part 2, 5).
6. "Shared Notes" doesn't actually share anything (Part 5).
7. No audit/login logging anywhere (Part 10).

**P2 — Medium priority**
8. Duplicate Inspection concept between System Inventory and Inspection Schedule needs a product decision (Part 6, 12).
9. Settings/Notifications not scoped per user, causing shared-device leakage (Part 4, 9).
10. Help Center documents features ("Audit Log," etc.) that don't exist yet (Part 8, Informational).
11. `usePreventiveMaintenance.ts` complexity/size — worth refactoring before adding more logic given its history of "BUG N" fixes (Part 1, 6, 13).

**P3 — Low priority / polish**
12. Delete five unused Dashboard analytics components (Part 1, 11).
13. Remove unused `@mui/*`/`@emotion/*` dependencies (Part 1, 13).
14. Normalize `modules/` vs `features/` folder placement (Part 13).
15. Add confirmation step to the admin page's Deactivate action, even ahead of it becoming real (Part 7).
16. Loading-skeleton coverage is inconsistent across modules — standardize before real network latency exists (Part 7).

---

## PART 15 — Module-by-Module Manual Test Plan

For each item: **what to test → exact action → expected result → what indicates a bug → what to send me if it fails.**

### Dashboard
1. **Greeting/date-time** — Load the dashboard. *Expected:* greeting matches time of day, name matches your logged-in account, clock updates live. *Bug sign:* wrong name, frozen clock, wrong date. *Send:* screenshot + your local time.
2. **Quick Actions** — Click Add Backup / Add PM / Add QA / Add Note in turn. *Expected:* navigates to the right module with its "add" form/modal pre-opened. *Bug sign:* wrong module opens, or the add form doesn't open. *Send:* which button, and what actually happened.
3. **Export Report** — Click Export Report. *Expected:* triggers your browser's print dialog (this is a known interim placeholder, not a bug by itself). *Bug sign:* nothing happens at all, or an error appears. *Send:* console error if any (F12 → Console).
4. **Work Queue / Calendar / Upcoming Deadlines** — Check they reflect real PM data you've entered. *Bug sign:* a task you completed elsewhere still shows as pending here, or vice versa. *Send:* the PM record's name + what you did to it + what the dashboard shows.

### Preventive Maintenance
5. **Create a PM task** — Add PM with a due date. *Expected:* appears in the table immediately, correct status (Upcoming/Due Today/Overdue) based on the date you chose. *Bug sign:* wrong status, task missing after refresh. *Send:* the exact date you set and the status shown.
6. **Complete a PM (with checklist)** — Complete one. *Expected:* moves to Completed/History, and if recurring, a new upcoming PM appears for the next cycle — only one new one, not duplicates. *Bug sign:* two new recurring tasks appear, or none. *Send:* screenshot of the table right after completing.
7. **Snooze** — Snooze a task to a new date. *Expected:* due date and status update to match. *Bug sign:* status doesn't match the new date. *Send:* old date, new date, resulting status shown.
8. **Search/filter/sort** — Try searching by machine name, filtering by department/status, sorting by due date. *Expected:* results narrow/order correctly and instantly. *Bug sign:* stale or wrong results. *Send:* your search term/filter combination and what showed up.
9. **Refresh persistence** — Reload the browser tab after any of the above. *Expected:* your changes are still there (this browser only — by design, not yet shared). *Bug sign:* data reverts or disappears. *Send:* what you did before refreshing.

### Backup Activities
10. **Create/run/verify a backup job** — Add a job, mark it run, fill in Done By/Verified By, complete it. *Expected:* status updates, history entry appears with the details you entered. *Bug sign:* history missing your entry, or `doneBy`/`verifiedBy` not saved. *Send:* what you typed in those fields vs. what's displayed afterward.
11. **Duplicate a job** — Use Duplicate. *Expected:* a copy appears with reset status/progress. *Bug sign:* duplicate carries over the wrong status. *Send:* original vs. duplicate screenshots.

### Monthly Hard Disk Tracker
12. **Start/complete/verify a cycle** — Walk through a full cycle. *Expected:* status progresses correctly, `completedBy`/`verifiedBy` you typed are retained. *Bug sign:* fields blank or reset after saving. *Send:* what you entered vs. what's shown.

### QA Activities
13. **Create and complete an activity** — Add one, then mark it complete leaving Completed By blank. *Expected:* you should be able to see exactly what value gets recorded (today it will likely say "Current User" literally — this is a known, already-flagged gap, not something new to report). *Bug sign:* anything else unexpected, e.g. the record disappearing or an error. *Send:* what value appears in Completed By after saving blank.
14. **Charts (trend/department completion)** — Confirm they reflect real entered data, not placeholder numbers. *Bug sign:* chart shows data that doesn't match your actual QA records. *Send:* your QA records vs. the chart screenshot.

### System Inventory
15. **Add/edit/delete an asset** — Full CRUD pass. *Expected:* changes reflected immediately and after refresh. *Bug sign:* stale table after edit, or delete doesn't remove the row. *Send:* which asset, which action, what happened.
16. **Complete an "inspection" from System Inventory** vs. **Inspection Schedule module** — Do one of each. *Expected:* confirm for yourself whether these feel like the same feature duplicated, or genuinely different purposes — this is a product question for you to weigh in on, not a pass/fail test. *Send:* your judgment call on whether they should be merged.

### Inspection Schedule
17. **Add and complete a scheduled inspection** — Full flow. *Expected:* status updates, appears in history. *Bug sign:* history panel doesn't show the completed entry. *Send:* screenshot of history panel.

### Notifications
18. **Trigger a PM/Backup/QA reminder** — Set a due date close to today on any module. *Expected:* a notification appears in the Notifications page, clicking it navigates to the source record. *Bug sign:* notification doesn't appear, or clicking it goes nowhere/wrong place. *Send:* which module, what due date you set, what happened when clicked.
19. **Mark read / delete** — Test both. *Expected:* state updates and persists after refresh. *Bug sign:* reverts after refresh.

### Notes
20. **Create a private note** — Add one, don't toggle Shared. *Expected:* visible only to you (can't fully verify without a second account — note this as expected behavior for now). 
21. **Toggle "Shared" on a note** — This is a known, already-confirmed non-functional feature (Part 5) — no need to re-test unless you want to double check the toggle itself doesn't error out. *Send:* only if it throws an error, not if it simply "doesn't share."

### Settings
22. **Change a general/notification setting** — Toggle something, refresh. *Expected:* setting persists in this browser. *Bug sign:* resets after refresh.

### User & Role Management
23. **Every action on this page is currently known-fake** (Part 5) — Invite/Edit/Deactivate/Access Logs. No need to file these as new bugs; they're already captured. If you want, confirm the specific wording/toasts match what I've described, in case anything's changed since this audit.

### Login / Auth
24. **Log in with a valid email and an obviously wrong password** — e.g. `megha.jadhav@rajaram.com` / `wrongpassword123`. *Expected today (known issue, already flagged):* you will likely be logged in successfully anyway. *Send:* confirm whether this is what happens, since this is the single most important thing to verify live before any further work.
25. **Forgot Password / Register** — Confirm both clearly say "backend not connected" rather than silently failing. *Bug sign:* either page pretends to succeed.

---

## PART 16 — Amazon Q Implementation Prompts

The following are ready to hand to Amazon Q one at a time. Each is scoped to a single confirmed issue, per your instructions. These do **not** implement Supabase/AWS integration — they fix what's fixable at the current (frontend-only) architecture layer, deferring backend-dependent items until you're ready.

---

**PROMPT 1 — Remove dead Dashboard analytics components**

> Problem: Five Dashboard components exist in `src/features/dashboard/components/` but are not imported or rendered anywhere in the app: `MachineHealthAndProgress.tsx`, `TaskDistributionChart.tsx`, `WeeklyOverviewChart.tsx`, `RecentActivityCard.tsx`, `DashboardKPICards.tsx`. They represent a design direction (fake KPIs/analytics charts) that the product explicitly does not want on the Dashboard.
> Current behavior: These files sit unused in the repo, are a maintenance/confusion risk, and could be accidentally re-imported later, reintroducing unwanted fake-analytics UI.
> Expected behavior: These five files are deleted from the repository. `DashboardPage.tsx` and all other files continue to compile and render exactly as they do today (they don't reference these components, so there should be zero behavioral change).
> Files/components likely involved: `src/features/dashboard/components/MachineHealthAndProgress.tsx`, `TaskDistributionChart.tsx`, `WeeklyOverviewChart.tsx`, `RecentActivityCard.tsx`, `DashboardKPICards.tsx`.
> Required logic: None — this is a deletion-only change.
> UI requirements: No visible change to the Dashboard at all.
> Data requirements: None.
> Edge cases: Confirm via a full-repo search that none of these five files are imported anywhere (including test files, storybook files, or docs) before deleting.
> What NOT to change: Do not touch `DashboardPage.tsx`, `DashboardHeader.tsx`, `WorkQueueTable.tsx`, `CalendarCard.tsx`, `UpcomingDeadlinesCard.tsx`, `PersonalNotesCard.tsx`, or any other currently-used Dashboard file.
> Validation requirements: Confirm zero remaining references via search before deleting.
> TypeScript check: `tsc --noEmit` must show no new errors after deletion.
> Production build check: `pnpm run build` (or `npm run build`) must succeed.
> Browser verification requirements: Load `/dashboard` and confirm it renders identically to before the change.

---

**PROMPT 2 — Remove unused MUI/Emotion dependencies**

> Problem: `package.json` lists `@mui/material`, `@mui/icons-material`, `@emotion/react`, and `@emotion/styled` as dependencies, but a full-repo search of `src/` shows zero imports of any of these packages anywhere in the codebase. The actual UI library in use is Radix UI + Tailwind CSS (`src/app/components/ui/`).
> Current behavior: These four unused packages are installed, adding unnecessary install time and potential bundle-size risk if anything ever accidentally imports them.
> Expected behavior: These four packages are removed from `package.json` dependencies and from the lockfile, with no change to app behavior or appearance.
> Files/components likely involved: `frontend/package.json`, `frontend/pnpm-lock.yaml`.
> Required logic: None.
> UI requirements: No visible change anywhere in the app.
> Data requirements: None.
> Edge cases: Before removing, re-confirm with a case-insensitive search across the entire `frontend/src` directory (not just `.tsx`/`.ts`, in case of a stray `.js` or config file) that `@mui` and `@emotion` are not referenced anywhere, including in `vite.config.ts`, `postcss.config.mjs`, or `tsconfig.json`.
> What NOT to change: Do not remove any Radix UI (`@radix-ui/*`) packages — those are actively used.
> Validation requirements: Confirm zero references before removing from `package.json`.
> TypeScript check: `tsc --noEmit` must show no new errors after removal and reinstall.
> Production build check: `pnpm install && pnpm run build` must succeed after removal.
> Browser verification requirements: Smoke-test the app (load Dashboard, one other module, and a modal/dialog) to confirm no visual regressions, since Radix components can sometimes be styled indirectly via shared theme tokens.

---

**PROMPT 3 — Fix "Shared Notes" to be honest about current capability (interim, pre-backend)**

> Problem: In `src/features/notes/`, notes have a `shared: boolean` field and a "Shared Notes" folder/UI, implying a note marked "Shared" becomes visible to other users. In reality, `noteService.ts` stores notes in a store keyed by `userId`, so a note remains visible only to its creator no matter how `shared` is set — this is a confirmed functional gap the current architecture cannot support until a real shared backend exists.
> Current behavior: Users can toggle "Shared" on a note and see it move into the "Shared Notes" folder within their own view, creating a false impression that others can now see it.
> Expected behavior (interim, until backend exists): Do not attempt to implement real cross-user sharing yet (that requires the backend). Instead, make the current single-user limitation honest and visible: (a) add a short, clearly-worded inline notice near the Shared toggle and inside the "Shared Notes" folder view stating that shared notes are not yet visible to other users pending backend integration, and (b) do not remove the `shared` field, folder, or toggle — keep them intact so the eventual backend-connected version has minimal rework.
> Files/components likely involved: `src/features/notes/components/NoteEditor.tsx`, `TagsSection.tsx` (wherever the Shared toggle UI lives), `src/features/notes/components/NotesSidebar.tsx` or `NotesList.tsx` (wherever "Shared Notes" folder is rendered), `src/features/notes/hooks/useNotes.ts`.
> Required logic: No data-layer changes. This is a UI-copy-only change — add a small warning/notice element, conditionally shown when viewing the Shared Notes folder or when the Shared toggle is on.
> UI requirements: Notice should be small, non-intrusive, and consistent with the existing toast/notice styling used elsewhere in the app (e.g., similar to the "backend not connected" messaging already used on ForgotPasswordPage/RegisterPage).
> Data requirements: None — no schema or storage changes.
> Edge cases: Ensure the notice doesn't appear for the "My Notes" folder or other non-shared folders; only for Shared Notes context.
> What NOT to change: Do not modify `noteService.ts`'s storage logic, do not attempt any cross-browser/cross-user sharing implementation in this pass, and do not remove the existing `shared` field or toggle.
> Validation requirements: Manually verify the notice appears only in the correct context (Shared Notes folder / when toggling Shared on).
> TypeScript check: `tsc --noEmit` must show no new errors.
> Production build check: `pnpm run build` must succeed.
> Browser verification requirements: Create a note, toggle Shared on, confirm the notice appears; navigate to My Notes, confirm the notice does not appear there.

---

**PROMPT 4 — Reconcile the two out-of-sync hardcoded user rosters**

> Problem: `src/auth/userDirectory.ts` (`ALLOWED_USERS`, used for real login) and `src/modules/admin/RoleManagementContent.tsx` (`EMPLOYEES` array, used for the mock admin table) list different email domains, different departments, and different role titles for the same three people, and the admin list is missing one of the three users (Kiran Yadav) entirely.
> Current behavior: Logging in as any of the 3 users shows a profile (name/role/department) that doesn't match what the User & Role Management admin screen displays for that same person.
> Expected behavior: Both lists show identical, internally-consistent data for all three users — same email domain, same department, same role title conventions — with all three users present in both places. This is still a temporary/hardcoded-data fix (per current architecture), not a backend integration; it only needs the two hardcoded sources to agree with each other and with the department values specified as authoritative for this project (all three users are IT Department, per the project brief) unless you tell Amazon Q otherwise at implementation time.
> Files/components likely involved: `src/auth/userDirectory.ts`, `src/modules/admin/RoleManagementContent.tsx`.
> Required logic: Ideally, `RoleManagementContent.tsx`'s `EMPLOYEES` array should be derived from `ALLOWED_USERS` (import and map it) rather than maintained as a second hand-written array, so the two can never drift apart again even before a real backend exists.
> UI requirements: No visual/layout change to either the Login page or the Admin page beyond the corrected data values.
> Data requirements: Single source of truth (`userDirectory.ts`) feeding both surfaces.
> Edge cases: Confirm role-title formatting logic in `RoleManagementContent.tsx` (e.g., `emp.role.split(" ").slice(-2).join(" ")`) still works sensibly against whatever role strings come from the shared source — adjust if needed so displayed role text stays readable.
> What NOT to change: Do not implement real invite/edit/deactivate functionality in this pass (that's a separate, larger prompt once real accounts exist) — this prompt only fixes data consistency between the two existing hardcoded sources.
> Validation requirements: Confirm all three users (Nikhil Sakat, Megha Jadhav, Kiran Yadav) appear identically in both the login flow and the admin Users tab.
> TypeScript check: `tsc --noEmit` must show no new errors.
> Production build check: `pnpm run build` must succeed.
> Browser verification requirements: Log in as each of the three users in turn; separately, view the Admin → Users tab; confirm all details match exactly across both surfaces for all three people.

---

**PROMPT 5 — Attribute "Completed By"/"Verified By"/"Done By" to the logged-in user by default, across all modules**

> Problem: Across Preventive Maintenance, QA, Backup Activities, and Monthly Hard Disk Tracker, the person who performed a completion/verification action is captured via a free-text input (in PM's case, hardcoded to the literal string `"Current User"`; in QA/Backup/Hard-Disk, a manually-typed field with a `"Current User"` placeholder). None of these are tied to the actual logged-in session (`useAuth()`), so any value — including someone else's name — can be recorded, and the PM module records no real name at all today.
> Current behavior: `usePreventiveMaintenance.ts` hardcodes `completedBy: "Current User"` and `user: "Current User"` directly in code (not even a form field). QA's completion form (`QAActivityDrawer.tsx`) has a free-text `completedBy` input with placeholder text `"Current User"`, falling back to that literal string if left blank. Backup (`useBackupActivities.ts`) and Hard Disk Tracker (`useMonthlyHardDiskTracker.ts`) similarly take `doneBy`/`completedBy`/`verifiedBy` as free-typed form values.
> Expected behavior: When any of these completion actions are performed, the "Completed By" value should default to the currently logged-in user's name (via `useAuth()`'s `user.name`), pre-filled automatically wherever there's a form field, and used directly (not hardcoded to a placeholder string) wherever there's no form field today (PM's completion flow). Where a form field exists, keep it editable for now (since there's no backend to enforce this server-side yet), but the *default* value must be the real logged-in user, not a placeholder string.
> Files/components likely involved: `src/features/preventive-maintenance/hooks/usePreventiveMaintenance.ts` (replace both hardcoded `"Current User"` occurrences), `src/features/qa/components/QAActivityDrawer.tsx` and `src/features/qa/hooks/useQA.ts`, `src/features/backup/hooks/useBackupActivities.ts` and its execution form component, `src/features/monthly-hard-disk-tracker/MonthlyHardDiskTrackerPage.tsx` and `hooks/useMonthlyHardDiskTracker.ts`. All should import and use `useAuth()` from `src/auth/AuthProvider.tsx`.
> Required logic: Each module's completion handler/form should read `user?.name` from `useAuth()` and use it as the default/actual value for the relevant actor field, instead of a hardcoded string or empty default.
> UI requirements: Where a text input currently exists for these fields, pre-fill it with the logged-in user's name on form open rather than leaving it blank with a placeholder.
> Data requirements: No schema changes — the field already exists as a `string` in every module's types; only the source of the default value changes.
> Edge cases: Handle the case where `useAuth()`'s `user` is `null` (shouldn't happen inside protected routes, but fall back gracefully to an empty string rather than throwing); handle existing persisted records that already have `"Current User"` stored — do not attempt to retroactively rewrite historical data in this pass, only fix the value used for new actions going forward.
> What NOT to change: Do not remove the editable text input in QA/Backup/Hard-Disk (some workflows may legitimately need one person completing on behalf of another until real per-action server-side attribution exists) — only change PM's hardcoded flow (which has no field at all) to actually use it, and change the *default* value everywhere else.
> Validation requirements: Confirm the logged-in user's real name appears (not the literal string "Current User") after completing a PM, QA activity, Backup job, or Hard Disk cycle while logged in as each of the three test accounts.
> TypeScript check: `tsc --noEmit` must show no new errors.
> Production build check: `pnpm run build` must succeed.
> Browser verification requirements: Log in as each of the three test users in turn, complete one record in each of the four modules, and confirm the recorded/displayed "Completed By" (or equivalent) value matches that user's real name.

---

**PROMPT 6 — Add basic route-level role gating to the Admin (User & Role Management) route**

> Problem: `/user-management` is wrapped only in the generic `ProtectedRoute` (checks "is anyone logged in"), with no check on the logged-in user's `role`. Any of the three current test accounts — including "Maintenance Lead" and "Operations Manager" — can reach the Admin page, even though the in-app Role & Permission Matrix implies only an "IT Head"/admin-level role should have Admin access.
> Current behavior: Navigating to `/user-management` (via URL or sidebar link, if the sidebar link isn't already conditionally hidden — verify this too) succeeds for every logged-in user regardless of role.
> Expected behavior: Only users whose `role` matches an approved admin role (define this as a small, explicit allow-list constant for now, e.g. `ADMIN_ROLES = ["IT Head", "IT Admin"]` — confirm the exact intended role name(s) with the product owner before finalizing, since current test data has inconsistent role titles per Prompt 4) can reach `/user-management`; everyone else attempting to navigate there (via URL or UI) is redirected to `/dashboard` with a toast explaining they don't have access. The sidebar/mobile-drawer link to Admin should also be hidden for non-admin roles, not just gated at the route level.
> Files/components likely involved: `src/app/App.tsx` (where the `/user-management` route is declared), a new small role-check helper (e.g., `src/auth/roles.ts` exporting `ADMIN_ROLES` and an `isAdminRole(role)` helper), `src/layout/Sidebar.tsx` and `src/layout/MobileDrawer.tsx` (to conditionally render the Admin nav item), possibly a new `AdminRoute` wrapper component alongside the existing `ProtectedRoute`.
> Required logic: `AdminRoute` should call `useAuth()`, check `isAdminRole(user?.role)`, and either render `children` or redirect to `/dashboard` (reusing the existing `<Navigate>` pattern from `ProtectedRoute.tsx`/`PublicRoute.tsx` for consistency) plus a `toast.error(...)` explaining why.
> UI requirements: Sidebar/mobile drawer Admin link only rendered for admin-role users; redirect should feel identical in style to the existing login redirect (no jarring blank screen).
> Data requirements: None beyond the existing `role` string already on `AuthUser`.
> Edge cases: Make sure this doesn't break the currently-passing `ProtectedRoute` behavior for unauthenticated users (unauthenticated should still go to `/login`, not `/dashboard`) — `AdminRoute` should be layered *inside* `ProtectedRoute`, checked only after authentication is confirmed.
> What NOT to change: Do not implement full granular per-module RBAC in this pass (that's a larger, backend-dependent effort) — this prompt only covers gating the one Admin route as an immediate, self-contained fix.
> Validation requirements: Confirm all three test accounts' actual role strings first (per Prompt 4's reconciliation), then confirm the allow-list matches the intended "who should have admin access" answer from the product owner before implementing.
> TypeScript check: `tsc --noEmit` must show no new errors.
> Production build check: `pnpm run build` must succeed.
> Browser verification requirements: Log in as a non-admin-role test user, confirm the Admin sidebar link is hidden and that manually navigating to `/user-management` redirects to `/dashboard` with an explanatory toast; log in as an admin-role test user, confirm normal access is unaffected.

---

**PROMPT 7 — Add a confirmation step to the (currently mock) "Deactivate" action in User & Role Management**

> Problem: In `src/modules/admin/RoleManagementContent.tsx`, the "Deactivate" button (UserX icon) in the Users table immediately fires `toast.error("User deactivated.")` on click with zero confirmation step, unlike other destructive actions elsewhere in the app (e.g., PM's `DeleteDialog.tsx`, System Inventory's `DeleteConfirmDialog.tsx`), which do require confirmation. This is still operating on mock data today, but the missing confirmation pattern should be fixed now so it's correct by the time this action becomes real.
> Current behavior: Clicking Deactivate has no confirmation step and immediately shows a toast, with no actual state change (since the underlying data is currently a hardcoded array).
> Expected behavior: Clicking Deactivate opens a confirmation dialog (following the same visual/interaction pattern as the existing `DeleteDialog`/`DeleteConfirmDialog` components elsewhere in the app) asking the user to confirm before proceeding; only on confirmation does the existing toast fire. This remains a frontend-only, mock-data change — do not attempt to make deactivation actually persist or affect real data in this pass.
> Files/components likely involved: `src/modules/admin/RoleManagementContent.tsx`; consider reusing or adapting the existing confirmation dialog pattern from `src/features/preventive-maintenance/components/DeleteDialog.tsx` or `src/features/system-inventory/components/DeleteConfirmDialog.tsx` for visual consistency rather than building a new one from scratch.
> Required logic: Add local component state to track which employee (if any) is pending deactivation confirmation; render the confirmation dialog conditionally; on confirm, run the existing toast logic (and clear the pending state); on cancel, just clear the pending state with no other effect.
> UI requirements: Dialog copy should clearly state which user is about to be deactivated (use their name) and that this action can be reversed later by a re-activation flow (if that's the intended eventual behavior — confirm with product owner) or state clearly if it's not reversible.
> Data requirements: None — still operating on the existing mock `EMPLOYEES` array.
> Edge cases: Cancelling the dialog must not fire the deactivation toast or change any state.
> What NOT to change: Do not implement real backend-connected deactivation in this pass; do not change the Edit or Invite User buttons in this prompt (those are separate, larger pieces of work once real user management exists).
> Validation requirements: Confirm the toast only fires after explicit confirmation, never on the initial button click.
> TypeScript check: `tsc --noEmit` must show no new errors.
> Production build check: `pnpm run build` must succeed.
> Browser verification requirements: Click Deactivate on a user row, confirm a dialog appears naming that user; click Cancel and confirm no toast fires; click Deactivate again and confirm the dialog, then confirm the action, and confirm the toast fires only then.

---

I'm ready for Step 3 — your manual testing pass. When you report something like "Dashboard: clicking Add QA does X but it should do Y," I'll cross-reference it against the relevant module's actual code and produce the next single-issue Amazon Q prompt in this same format.

