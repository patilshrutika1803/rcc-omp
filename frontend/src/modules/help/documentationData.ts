// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION DATA
// Centralized documentation entries for the Help Center
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentationEntry {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  purpose: string;
  howToUse: string[];
  importantActions: string[];
  tips: string[];
  commonMistakes: string[];
  updated: string;
}

export const DOCUMENTATION_ENTRIES: DocumentationEntry[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    category: "Overview",
    shortDescription: "High-level operational dashboard for the current work queue, calendar, notes, and quick navigation.",
    purpose: "The dashboard is the landing page for the current user. It surfaces the live work queue, key deadlines, a calendar view, and the latest personal note so the team can open the most relevant operational module quickly.",
    howToUse: [
      "Open the Dashboard from the main navigation to review the current work queue.",
      "Use the quick-action buttons to open Backup Activities, Preventive Maintenance, or QA Activities directly.",
      "Review calendar events and upcoming deadlines from the right-side summary cards.",
      "Use the personal note panel for a quick reference or starter note before opening the Notes module.",
    ],
    importantActions: [
      "Quick actions open the relevant operational module without leaving the dashboard.",
      "Upcoming deadlines and the work queue reflect the current local records stored for the signed-in user session.",
      "The dashboard clock is displayed in Asia/Kolkata timezone for the current browser session.",
    ],
    tips: [
      "Check the work queue first when starting the day so overdue or due-soon items are visible immediately.",
      "Use the quick actions for faster access to recurring operational workflows instead of navigating manually.",
    ],
    commonMistakes: [
      "Do not assume dashboard data is shared from a backend service; it is produced from the current local app state and storage entries.",
      "Opening a task from the dashboard still requires the relevant module to be completed or updated in the source record.",
    ],
    updated: "today",
  },
  {
    id: "preventive-maintenance",
    title: "Preventive Maintenance",
    category: "Operations",
    shortDescription: "Schedule and complete recurring preventive maintenance tasks tied to system records and due-date reminders.",
    purpose: "The Preventive Maintenance module manages recurring maintenance tasks and reminder cycles for systems. The app tracks the next due date, reminders, frequency, completion notes, and recurrence chains for each PM record.",
    howToUse: [
      "Open Preventive Maintenance from the sidebar to view active and due tasks.",
      "Create a PM item by assigning a system, frequency, due date, assigned user, and any notes or checklist items.",
      "Complete a PM only after the due-date gate is reached; the shared recurring workflow blocks premature completion.",
      "When a PM is completed for a recurring task, the app creates the next cycle and keeps a recurrence chain via the recurrence ID fields.",
      "Use the reminder logic to surface in-app notifications before the task becomes due.",
    ],
    importantActions: [
      "Recurring PMs generate subsequent cycles automatically instead of creating one-off entries indefinitely.",
      "Completion records store previous due date, maintenance date, and history entries for traceability.",
      "The system-level reminder and due-date logic is shared across recurring workflows and is not duplicated per page.",
    ],
    tips: [
      "Review the next due date before closing a PM so the cycle is created with the correct schedule.",
      "Keep the assigned system and department fields accurate; these are also used in the scheduled reminder workflow.",
    ],
    commonMistakes: [
      "Do not try to mark a PM complete before the due time; the app intentionally blocks premature completion.",
      "Do not expect PMs to be tied to a separate machine module; the current live implementation uses System Inventory records as the asset source.",
    ],
    updated: "today",
  },
  {
    id: "backup-activities",
    title: "Backup Activities",
    category: "Data Protection",
    shortDescription: "Manage recurring backup jobs, job history, and reminder-based completion tracking.",
    purpose: "Backup Activities tracks operational backup jobs, last/next backup windows, retention details, and recurring schedules. It also creates reminder notifications based on the configured priority and due date logic.",
    howToUse: [
      "Open Backup Activities from the sidebar to see all backup jobs and their current due or completion state.",
      "Add a backup job with a name, department, destination, frequency, and backup window information.",
      "Review backup history to see previous cycles, status changes, and references to the next scheduled backup.",
      "Complete a backup job after the due time is reached so the next recurring job is generated without creating duplicates.",
    ],
    importantActions: [
      "Backup-related reminders are generated from the app's shared notification utilities and can be suppressed through Notification Settings.",
      "The backup job model stores a recurrence ID and next backup metadata so the app can generate the next cycle in sequence.",
      "Backup alerts are limited to the current notification settings: maintenance, backup, and QA-specific toggles.",
    ],
    tips: [
      "Use a clear job name and destination so the task is easy to match in the notification list and activity history.",
      "Review the previous due date and next due date before updating a recurring backup job.",
    ],
    commonMistakes: [
      "Do not assume the app performs external restore testing automatically; it tracks backup execution and reminders, but execution details remain local to the UI state.",
      "Do not treat backup records as self-healing; a failed or missed backup still needs operator follow-up.",
    ],
    updated: "today",
  },
  {
    id: "monthly-hard-disk-tracker",
    title: "Monthly Hard Disk Tracker",
    category: "Asset Monitoring",
    shortDescription: "Track monthly disk metrics, disposal/dispatch flow, and accountability records for storage devices.",
    purpose: "This module is focused on monthly hard disk tracking and accountability. It records dispatch, return, and accountability steps for disks as part of a controlled monthly flow.",
    howToUse: [
      "Open Monthly Hard Disk Tracker from the sidebar to review per-month hard disk state.",
      "Use the dispatch, accountability, and return workflow to move a disk through the operational cycle.",
      "Check the current status of each disk and ensure the due-date gates for each milestone are respected.",
    ],
    importantActions: [
      "This tracker uses explicit statuses and due-date logic rather than a generic free-form task board.",
      "Reminder generation is present for lifecycle events such as dispatch and accountability checkpoints.",
    ],
    tips: [
      "Keep each hard disk's lifecycle state current so the monthly tracker remains accurate.",
      "Review due dates before changing a disk's status to avoid creating conflicting state transitions.",
    ],
    commonMistakes: [
      "Do not confuse this with a generic storage capacity dashboard; the module is currently built around monthly disk lifecycle tracking, not broad infrastructure monitoring.",
    ],
    updated: "today",
  },
  {
    id: "qa-activities",
    title: "QA Activities",
    category: "Quality",
    shortDescription: "Track recurring QA actions, due dates, and completion history for inspection and compliance work.",
    purpose: "The QA module tracks QMS-numbered activities, departments, due dates, reminders, and completion status. It follows the same recurring workflow model as Preventive Maintenance and Backup Activities for due-date compliance.",
    howToUse: [
      "Open QA Activities to review due, upcoming, and completed QA tasks.",
      "Create or edit a QA activity with its QMS reference, department, due date, reminder setting, and assigned user.",
      "Complete the action only once the due date/time is reached; premature completion is blocked.",
      "Recurring QA tasks create the next cycle after completion so the schedule continues automatically.",
    ],
    importantActions: [
      "QA task reminders are also controlled through the notification settings and local notification store.",
      "Completed QA entries retain completion notes and action history so the record remains auditable.",
    ],
    tips: [
      "Keep the assigned user and department consistent so reminders and operational assignments remain accurate.",
      "Use the QMS reference for traceability across recurring cycles.",
    ],
    commonMistakes: [
      "Do not mark QA activities complete before the due time; the recurrence logic is designed to prevent it.",
    ],
    updated: "today",
  },
  {
    id: "system-inventory",
    title: "System Inventory",
    category: "Asset Management",
    shortDescription: "Maintain the current active asset register for systems, departments, assigned users, and inspection schedules.",
    purpose: "System Inventory is the active asset management module in the current app. It stores system records, their departments, locations, assigned users, purchase metadata, and recurring inspection settings. This is the current replacement for older machine-oriented concepts.",
    howToUse: [
      "Open System Inventory to view the assets currently tracked in the portal.",
      "Add or edit system entries with type, category, department, location, assigned user, status, and supporting metadata.",
      "Use inspection settings and PM settings to attach recurring operational schedules to the asset record.",
      "Review the system's inspection and maintenance state before scheduling or completing work.",
    ],
    importantActions: [
      "System Inventory is the source of truth for live asset records used by preventive maintenance and inspection modules.",
      "The app stores custom PM and inspection settings on each system, including frequency, next due, reminder information, and assigned user.",
    ],
    tips: [
      "Keep the system ID, department, and assigned user fields current so the downstream schedules remain accurate.",
      "Use System Inventory as the first place to check whether a missing asset or stale schedule is behind the issue.",
    ],
    commonMistakes: [
      "Do not rely on older machine-specific terminology; the live application uses System Inventory as the working asset model.",
      "Do not assume a system can be scheduled without first having a valid record in the inventory list.",
    ],
    updated: "today",
  },
  {
    id: "inspection-schedule",
    title: "Inspection Schedule",
    category: "Compliance",
    shortDescription: "Plan and complete recurring system inspections and scheduled checks tied to inventory records.",
    purpose: "The Inspection Schedule module coordinates recurring inspections for the current asset registry. It tracks next due dates, reminders, completion, and recurring cycle generation for system inspections.",
    howToUse: [
      "Open Inspection Schedule from the sidebar to review scheduled inspections.",
      "Create an inspection that references a system and includes the relevant due date, reminder period, and assigned user.",
      "Complete the inspection only after the due date/time window is reached to avoid premature completion.",
      "When a recurring inspection is completed, the next inspection cycle is generated automatically.",
    ],
    importantActions: [
      "Inspection workflows use the same date and reminder gating model as the PM and QA modules.",
      "Notifications for inspection reminders are generated and cleaned up through the shared local notification storage layer.",
    ],
    tips: [
      "Always validate the selected system before creating or updating the inspection schedule.",
      "Keep the reminder and priority fields aligned with the operation's urgency.",
    ],
    commonMistakes: [
      "Do not treat inspections as a separate asset store; they are linked to the inventory asset model and its schedules.",
    ],
    updated: "today",
  },
  {
    id: "notifications",
    title: "Notifications",
    category: "Communication",
    shortDescription: "Review active alerts, mark them read, and manage the current in-app notification lifecycle.",
    purpose: "Notifications in the current app are stored in local storage and act as the shared alert layer for PM, QA, backup, and inspection reminders. Deleted notifications are moved to a retention-based trash state rather than removed permanently immediately.",
    howToUse: [
      "Open the Notifications page from the sidebar or header area to review unread and archived items.",
      "Use the unread count to focus on alerts that still need attention.",
      "Mark notifications as read when action is complete, or delete them to move them to the retention-based trash state.",
      "Adjust the notification preferences under Settings for in-app push notifications, maintenance alerts, backup alerts, and QA alerts.",
    ],
    importantActions: [
      "Deleted notifications are marked with a deleted flag and deletedAt timestamp, then removed automatically after a 30-day retention window.",
      "Unread counts ignore archived and deleted items, which aligns with the current notification store implementation.",
      "The app prevents duplicate reminder notifications for the same recurring item using a stable notification key.",
    ],
    tips: [
      "Check the Notifications center before closing out a due task so you do not miss a generated reminder.",
      "Use Settings to mute categories you do not want to surface into the app's active notification feed.",
    ],
    commonMistakes: [
      "Do not assume email or SMS delivery is implemented across the app; the visible settings only expose the current local in-app and toggle-based notification model.",
      "Do not treat deletion as immediate permanent removal; the current logic retains deleted entries briefly in the notification store.",
    ],
    updated: "today",
  },
  {
    id: "notes",
    title: "Notes",
    category: "Personal Workspace",
    shortDescription: "Create notes for the signed-in user, manage folders, and keep quick operational references in a personal store.",
    purpose: "The Notes module stores note records per current user in local storage. Notes are grouped into folder-based organization, including My Notes, Pinned, and Shared Notes patterns in the current UI.",
    howToUse: [
      "Open the Notes page to view only the notes for the currently signed-in user.",
      "Create a note, assign a title, content, tags, and folder, then save it.",
      "Pin a note or mark it as shared if the current UI exposes that action, while keeping the user-scoped storage model in mind.",
      "Use search within Notes to find content by title or note text.",
    ],
    importantActions: [
      "Notes are stored under the current employee ID or email value, so they do not mix across user sessions.",
      "The note service does not currently store source/module metadata such as a linked feature or system ID on each note record.",
    ],
    tips: [
      "Use consistent titles and tags to make searching easier when the note list grows.",
      "Keep operational checklists and quick references in personal notes for fast access on the dashboard and notes page.",
    ],
    commonMistakes: [
      "Do not assume notes are team-shared records by default; the app persists them per user and uses a basic folder-based local flow.",
    ],
    updated: "today",
  },
  {
    id: "user-role-management",
    title: "User & Role Management",
    category: "Administration",
    shortDescription: "Manage local portal users, roles, department assignments, and active status records.",
    purpose: "The app exposes a local user management screen for administrators to add, edit, search, delete, and change status for users. The current role model is intentionally limited to three values: Operations Manager, Maintenance Lead, and IT Admin.",
    howToUse: [
      "Open User & Role Management from Settings or the admin route to review the current managed user list.",
      "Add a new user with name, email, department, employee ID, role, and contact details.",
      "Edit existing user records or toggle their status between Active and Inactive.",
      "Search for users by name, email, role, department, or employee ID.",
    ],
    importantActions: [
      "The active role set is normalized to the three supported roles defined in the auth user directory.",
      "Entries are persisted in browser local storage so the list remains available during a session and across reloads.",
    ],
    tips: [
      "Use the employee ID and department fields consistently so the same user record is easy to audit later.",
      "Keep the active role list aligned with the current supported values instead of inventing custom role names.",
    ],
    commonMistakes: [
      "Do not assume the app supports a long list of role types beyond the current three-role model.",
      "Do not remove the signed-in account from the management list; the UI deliberately protects the currently logged-in user from being deleted.",
    ],
    updated: "today",
  },
  {
    id: "settings",
    title: "Settings",
    category: "Configuration",
    shortDescription: "Configure portal preferences, notification toggles, access info, and local admin settings.",
    purpose: "The Settings page exposes the current configuration surface available in the frontend. It includes General settings, Notification Preferences, Security guidance, and a Roles & Permissions entry point to the user-management screen.",
    howToUse: [
      "Open Settings and switch between General, Notifications, Security, and Roles & Permissions.",
      "Update the portal name, organization, language, date format, timezone, and refresh preferences in General.",
      "Toggle the available notification controls in Notification Preferences to enable or disable in-app push, SMS, maintenance, backup, and QA alerts.",
      "Use the Security section to review the current frontend-only status and note the feature limitations in this build.",
    ],
    importantActions: [
      "Notification settings are saved in browser local storage and reloaded through the dedicated notification settings utilities.",
      "The current app does not expose a full password management or MFA workflow in this frontend-only implementation.",
    ],
    tips: [
      "Save general settings only after verifying the date format and timezone for the current team.",
      "Review notification settings whenever the alert volume becomes noisy or an operational process changes.",
    ],
    commonMistakes: [
      "Do not expect advanced security features such as two-factor authentication or external identity provider configuration in this build.",
      "Do not assume settings are backed by a remote database; the frontend persists the currently exposed settings locally in the browser.",
    ],
    updated: "today",
  },
];

export function getDocumentationById(id: string): DocumentationEntry | undefined {
  return DOCUMENTATION_ENTRIES.find((doc) => doc.id === id);
}

export function searchDocumentation(query: string): DocumentationEntry[] {
  const lowerQuery = query.toLowerCase();
  return DOCUMENTATION_ENTRIES.filter(
    (doc) =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.shortDescription.toLowerCase().includes(lowerQuery) ||
      doc.purpose.toLowerCase().includes(lowerQuery) ||
      doc.category.toLowerCase().includes(lowerQuery)
  );
}
