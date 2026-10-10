# TutorLink Bangladesh (Tuition Media) 🎓🇧🇩

A modern, full-stack tuition media and tutor-matching platform tailored for Bangladesh. TutorLink seamlessly connects guardians and students with qualified tutors, featuring comprehensive administrative workflow management, demo class scheduling, application pipelines, and payment tracking.

---

## ✨ Features

- **For Guardians & Students:**
  - Post tuition requests with class, subject, medium, area, days per week, and salary preferences.
  - Browse verified tutors by subject, institution, and location.
  - Guardian dashboard to monitor tuition requests, applications, and demo classes.

- **For Tutors:**
  - Search and filter available tuition jobs across Bangladesh.
  - Detailed tutor profiles with educational background, subjects, and verification status.
  - One-click application process for matching tuition jobs.

- **For Administrators:**
  - **Comprehensive Admin Dashboard:** Real-time statistics on tuitions, tutors, guardians, demos, and revenue.
  - **Tuition Workflow & Timeline:** Manage status changes (Open, Assigned, Completed, Cancelled).
  - **Demo Class Management:** Schedule, track, and record feedback for demo classes.
  - **Payment & Commission Tracking:** Monitor media fees and payment statuses.
  - **Verification Pipeline:** Verify tutor credentials and guardian profiles.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Motion (Framer Motion), Recharts
- **Backend:** Node.js, Express, TypeScript, TSX
- **Database & ORM:** PostgreSQL / Supabase, Drizzle ORM
- **Authentication:** JWT & Cookie-based sessions

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- Git
- PostgreSQL or [Supabase](https://supabase.com/) database

### 2. Environment Setup
Copy the example environment file and set your credentials:
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
DATABASE_URL="your-postgresql-connection-string"
GEMINI_API_KEY="your-gemini-api-key"
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Installation
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📦 Production Build

```bash
# Build frontend and server bundle
npm run build

# Start production server
npm start
```

---

## 🛡️ License

This project is private and proprietary.
