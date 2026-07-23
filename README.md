# RCC-OMP (Rajaram Consumer Care – Operational Management Portal)

<p align="center">
  <strong>Enterprise Operations Management Portal for Rajaram Consumer Care Pvt. Ltd.</strong><br>
  Streamlining Preventive Maintenance, Quality Activities, Backup Management, Notifications, and IT Operations.
</p>

---

## 📌 Overview

RCC-OMP is an enterprise web application developed for the IT Department of **Rajaram Consumer Care Pvt. Ltd.** to digitize and automate operational activities.

The portal replaces manual registers, Excel sheets, and paper-based maintenance records with a centralized management system that improves tracking, accountability, and reporting.

---

## ✨ Current Features

### 🔧 Preventive Maintenance
- Create, Edit & Delete PM Tasks
- Recurring Preventive Maintenance
- Automatic Due Date Calculation
- Reminder Notifications
- PM History
- Checklist Workflow (In Progress)
- Search & Filters
- Table & Card Views
- Priority Management
- Department Management
- Status Tracking
- Duplicate Prevention

---

### 🔔 Notifications

- PM Reminder Notifications
- Notification Badge
- Mark as Read
- Delete Notifications
- Navigate directly to the related PM

---

### 📊 Dashboard

- Summary Cards
- Activity Overview
- Responsive Dashboard Layout

(Currently frontend implementation)

---

### 🏢 Department Management

- Shared department master
- Used across multiple modules

---

### 📱 Responsive UI

- Desktop
- Tablet
- Mobile Friendly

---

## 🚧 Upcoming Features

- ✅ Supabase Authentication
- ✅ AWS Backend Integration
- ✅ PostgreSQL Database
- ✅ System Inventory
- ✅ QA Activities
- ✅ Backup Activities
- ✅ GxP / Non-GxP Deadlines
- ✅ Hard Disk Tracking
- ✅ Dynamic Checklist Templates
- ✅ PDF & DOC Export
- ✅ Email Notifications
- ✅ Role Based Access
- ✅ Audit Logs

---

# 🏗️ Project Architecture

```text
Frontend (React + TypeScript)

        │

        ▼

AWS API Gateway

        │

        ▼

AWS Lambda (Node.js)

        │

        ▼

Supabase PostgreSQL

        │

        ▼

AWS S3 Storage
```

---

# 💻 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Backend (Planned)

- AWS Lambda
- AWS API Gateway
- Node.js

## Database

- Supabase PostgreSQL

## Storage

- AWS S3

## Authentication

- Supabase Auth

## Deployment

- Vercel

---

# 📂 Project Structure

```text
frontend/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── constants/
│   ├── features/
│   │      ├── dashboard/
│   │      ├── preventive-maintenance/
│   │      ├── notifications/
│   │      ├── backup/
│   │      ├── qa/
│   │      └── inventory/
│   │
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── types/
│
└── public/
```

---

# 📋 Modules

## Preventive Maintenance

- Recurring Maintenance
- Due Date Management
- Reminder Engine
- Notifications
- History
- Checklist Workflow
- Export PDF (Upcoming)

---

## Quality Activities

- QMS Tracking
- Department-wise Activities
- Target Dates
- Reminders

---

## Backup Activities

- Backup Scheduling
- Verification Workflow
- Export Reports
- Reminder System

---

## System Inventory

- Laptop Management
- Desktop Management
- Printer Management
- System Assignment
- Department Mapping

---

## Notifications

- PM Alerts
- Backup Alerts
- QA Alerts
- Upcoming Deadlines

---

# 📸 Screenshots

> Screenshots will be added as development progresses.

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/patilshrutika1803/rcc-omp.git
```

Navigate to the frontend

```bash
cd frontend
```

Install dependencies

```bash
pnpm install
```

Run development server

```bash
pnpm run dev
```

Build project

```bash
pnpm run build
```

---

# 📌 Development Status

| Module | Status |
|---------|--------|
| Frontend Architecture | ✅ Completed |
| Dashboard | ✅ Completed |
| Preventive Maintenance | 🟢 Nearly Complete |
| Notifications | ✅ Completed |
| QA Activities | 🟡 In Progress |
| Backup Activities | 🟡 Planned |
| System Inventory | 🟡 Planned |
| Authentication | 🔜 Planned |
| Backend | 🔜 Planned |
| Database | 🔜 Planned |

---

# 🎯 Project Roadmap

### Phase 1
- Frontend Development
- PM Module
- Notifications

### Phase 2
- Authentication
- Backend APIs
- Database

### Phase 3
- Inventory
- QA Activities
- Backup Activities

### Phase 4
- Reports
- PDF Export
- Email Notifications

### Phase 5
- Production Deployment
- Security
- Performance Optimization

---

# 👩‍💻 Developer

**Shrutika Patil**

B.Tech Computer Engineering

Built as an enterprise operational management solution for the IT Department of Rajaram Consumer Care Pvt. Ltd.

---

# 📄 License

This project is developed for educational and organizational purposes.

All rights reserved © Rajaram Consumer Care Pvt. Ltd.
