RCC OMP – Preventive Maintenance Module Improvements (Enterprise Version)

This is an enterprise Operations Management Portal (RCC OMP) for Rajaram Consumer Care Pvt. Ltd.

Improve ONLY the Preventive Maintenance module.

Do not redesign the page.
Keep the current RCC OMP design system, layout, spacing, colors, typography and branding exactly the same.

The objective is to make every interaction functional and realistic while keeping the UI clean and enterprise-ready.

1. Remove Bulk Selection

Remove the checkbox from the table header.

Remove the checkbox beside every machine row.

These checkboxes serve no purpose because there are no bulk actions.

Instead, increase the clickable area of each row.

2. Add "Check All Preventive Maintenance"

Near the top action buttons, add a new button:

✔ Check All PM

Purpose:

Refresh all preventive maintenance schedules.

When clicked:

Recalculate Due Today
Recalculate Overdue
Recalculate Upcoming
Refresh Maintenance Timeline
Refresh Dashboard cards
Show success toast

Toast:

"Preventive Maintenance status refreshed successfully."

3. Add Preventive Maintenance

The Add PM dialog already exists.

Complete its functionality.

When Save PM Task is clicked:

Validate every required field.

Required fields:

Machine Name
Machine ID
Department
Frequency
Priority
Due Date
Assigned Engineer

If validation fails

Show inline validation.

If validation succeeds

Show loading state.

Add the schedule.

Automatically

Close popup
Add record to table
Add machine card
Refresh timeline
Refresh dashboard counts

Show toast

"Preventive Maintenance Schedule Added Successfully"

4. Edit Preventive Maintenance

Currently Edit does nothing.

Implement Edit.

When Edit is clicked

Open the same Add PM dialog.

Populate all fields.

Allow editing.

Button should become

Update PM Task

After update

Refresh

Table
Timeline
Dashboard
Cards

Show toast

"Maintenance Schedule Updated Successfully"

5. Three Dot Menu

Currently inactive.

Open dropdown containing

• View Details

• Edit

• Duplicate

• Mark Complete

• Snooze

• Delete

Every option should open the correct dialog.

6. Mark Complete

Currently popup opens but Confirm Complete button does nothing.

Implement it.

When confirmed

Save completion notes
Change status to Completed
Remove overdue badge
Update machine history
Refresh dashboard counts
Refresh maintenance timeline
Refresh table

Show toast

"Maintenance Completed Successfully"

7. Snooze

Currently popup opens but Apply Snooze does nothing.

Implement complete behaviour.

Support

1 Day
3 Days
7 Days
Custom Date

After snoozing

Update

Due Date
Timeline
Table
Card
Dashboard

Show toast

"Maintenance Snoozed Successfully"

8. View Machine Details

Clicking any machine should open complete Machine Details.

Tabs

Machine Information
History
Schedule
Timeline

Inside this popup

Edit should work.

Mark Complete should work.

Snooze should work.

9. Timeline

Whenever any PM is

Added

Updated

Completed

Deleted

Snoozed

Automatically refresh Maintenance Timeline.

Newest activity should always appear first.

10. Dashboard Cards

Automatically refresh

Total PM

Due Today

Upcoming

Completed

Overdue

after every operation.

11. Filters

Department

Frequency

Priority

Status

Date Range

should instantly filter

Cards
Table
Timeline
Dashboard Counts

without page refresh.

12. Search

Searching should work using

Machine Name

Machine ID

Department

Engineer

Status

Search results should update instantly.

13. Pagination

Pagination should update automatically after

Add

Delete

Search

Filter

Edit

Previous and Next buttons should enable/disable correctly.

14. Empty State

If no PM records exist

Display

"No Preventive Maintenance Records Found"

Include

Add Preventive Maintenance button.

15. Delete Preventive Maintenance

Implement Delete.

Before deleting

Show confirmation dialog.

After deletion

Refresh

Table

Timeline

Dashboard

Cards

Show toast

"Maintenance Deleted Successfully"

16. Toast Notifications

Use enterprise toast notifications.

Examples

✔ Maintenance Added Successfully

✔ Maintenance Updated Successfully

✔ Maintenance Deleted Successfully

✔ Maintenance Completed Successfully

✔ Maintenance Snoozed Successfully

✔ Status Refreshed Successfully

✔ Export Started

✔ Export Completed

❌ Validation Failed

❌ No Records Found

17. Status Logic

Status badges should automatically update.

Possible states

Upcoming

Due Today

Overdue

Completed

based on Due Date.

18. Export

Keep Export button.

For now export current displayed data.

Future compatibility:

Export format should later be Microsoft Word (.docx) instead of PDF.

Do not redesign this button.

19. Loading States

Show loading indicators while

Saving

Updating

Deleting

Completing

Exporting

Importing

Refreshing

20. UI Polish

Improve spacing where required.

Align icons consistently.

Standardize button heights.

Standardize modal footers.

Improve hover effects.

Maintain enterprise look.

21. Backend Ready

Design all interactions assuming future backend APIs.

Every operation should follow proper CRUD flow.

Avoid hardcoded behaviour.

Prepare components so they can later connect directly with APIs without UI redesign.

Final Objective

The Preventive Maintenance module should feel like a complete enterprise application where every visible button, icon, dropdown, popup, dialog and action works correctly, provides proper user feedback through toast notifications, updates the UI instantly, and maintains a professional RCC OMP experience suitable for production and future backend integration.