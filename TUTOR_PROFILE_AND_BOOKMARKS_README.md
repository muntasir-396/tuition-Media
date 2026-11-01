# Tutor Profile & Bookmarks Module — TutorLink Bangladesh

This document outlines the architectural changes, database migrations, API specifications, and security guarantees implemented for the complete Tutor Profile module (11 sections) and Unified Database Bookmarks module.

---

## 1. Architecture & Security Overview

### Zero Data Leakage & IDOR Protection
- **Ownership Verification on All Private Routes:** The backend extracts the authenticated `userId` exclusively from the verified JWT cookie (`req.user.id`). Client-provided `tutorId` is never accepted for modifying private data. Attempting to access or alter another tutor's education, experience, or documents returns an uninformative `404 Not Found`.
- **Strict Whitelist Serializer (`serializeTutorForPublic`):** Public callers and guardians only receive whitelisted safe fields (name, university, department, rating, reviews count, verified badge, expected salary, teaching mediums/classes/subjects).
- **Guaranteed Sensitive Field Redaction:** Tutor phone number, email address, NID number, present/permanent physical addresses, uploaded document storage paths, parent/emergency contact numbers, and bank/payout account details are strictly omitted from public views until a tuition is confirmed with that tutor.
- **Biographical Sanitizer (`sanitizeBioText`):** Automatically strips phone numbers (`01[3-9]\d{8}`) and URLs/messaging links (`https://`, `wa.me/`, etc.) from bios to prevent unauthorized off-platform circumvention.
- **Application Gating (>= 80%):** Tutors cannot apply for jobs unless their profile completion score is at least 80% (computed dynamically on the server across Personal, Contact, Education, Preferences, Areas, Experience, Documents, and Emergency contacts).

---

## 2. Database Schema (PostgreSQL + Drizzle)

The following normalized tables were created in [src/db/schema.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/tutorlink-bangladesh/src/db/schema.ts) and initialized in [src/db/seed.ts](file:///Users/muntasirmamun/Muntasir/PROJECT/tutorlink-bangladesh/src/db/seed.ts):

| Table Name | Description | Key Relationships |
|---|---|---|
| `tutor_profiles` | Enhanced core profile with tagline, short bio, nationality, marital status, masked NID, and privacy settings | 1:1 `users.id` |
| `tutor_education` | Repeatable education records (level, degree, institute, passing year, result, currently studying, student ID) | `tutorId -> tutor_profiles.id` (CASCADE) |
| `tutor_experience` | Past tuition records, achievements, intro video link, reference contact | `tutorId -> tutor_profiles.id` (CASCADE) |
| `tutor_certifications`| Training and professional credentials | `tutorId -> tutor_profiles.id` (CASCADE) |
| `tutor_preferences` | Tuition mediums, classes, subjects, tuition types, salary range, gender preference | 1:1 `tutorId -> tutor_profiles.id` (CASCADE) |
| `tutor_areas` | Specific geographical areas tutor travels to | `tutorId`, `areaId` |
| `tutor_availability` | Weekly day (Sat-Fri) and time-slot matrix (morning, afternoon, evening, night) | `tutorId`, `day`, `slot` |
| `tutor_documents` | Verification documents (NID front/back, university ID, marksheet) with audit status | `tutorId -> tutor_profiles.id` (CASCADE) |
| `tutor_payment_info` | Mobile wallet (bKash/Nagad/Rocket) or bank details with masked display | 1:1 `tutorId -> tutor_profiles.id` (CASCADE) |
| `tutor_emergency_contacts` | Private guardian & emergency contact info (never exposed to public) | 1:1 `tutorId -> tutor_profiles.id` (CASCADE) |
| `bookmarks` | Persistent target bookmarks for tuitions and tutors | `userId`, `targetType`, `targetId` (UNIQUE) |
| `profile_audit_logs` | Audit trail of profile mutations and administrative access | `who`, `field`, `oldValue`, `newValue`, `at` |
| `subjects` | Standardized curriculum subject directory with categories | `name`, `category`, `approved` |

---

## 3. API Endpoints

### Tutor Profile (`/api/tutor`)
- `GET /api/tutor/me/profile`: Fetches full private profile with all relations and completion calculation.
- `PATCH /api/tutor/me/profile/:section`: Validates via Zod and updates a specific section (`personal`, `contact`, `preferences`, `areas`, `availability`, `payment`, `emergency`, `privacy`).
- `POST /api/tutor/me/education`: Adds an educational credential.
- `DELETE /api/tutor/me/education/:id`: Removes an educational credential (enforces ownership).
- `POST /api/tutor/me/experience`: Adds a tuition experience record.
- `DELETE /api/tutor/me/experience/:id`: Removes an experience record (enforces ownership).
- `GET /api/tutor/me/completion`: Returns real-time completion score (0-100) and missing checklist items.
- `GET /api/public/tutors/:id`: Returns whitelisted safe fields only.

### Unified Bookmarks (`/api/bookmarks`)
- `POST /api/bookmarks`: Idempotently saves a bookmark (`targetType`: `'tuition' | 'tutor'`, `targetId`).
- `DELETE /api/bookmarks/:targetType/:targetId`: Removes a bookmark.
- `GET /api/bookmarks?type=&status=&sort=`: Returns full saved job / saved tutor lists with relation metadata.
- `GET /api/bookmarks/ids`: Returns lightweight lists `{ tuitionIds: string[], tutorIds: string[] }` used to populate bookmark icons across cards and detail pages.

---

## 4. User Interface Views & Features

1. **Tutor Profile (`/tutor/profile`):**
   - **Top Summary Card:** Profile photo, verified badge, department + university, rating & reviews, real-time completion progress bar with "What's missing" modal, and account status badge.
   - **Sticky Navigation:** 11 sections (Personal, Contact & Address, Education, Preferences, Areas & Availability, Experience, Documents, Payment Info, Emergency Contact, Reviews, Account & Privacy).
   - **Inline Edit & Autosave:** Each section has a clean View mode and inline Edit mode with field validation and immediate score recalculation.
   - **Action Controls:** "Preview as Guardian" modal (showing how the public sees the profile) and "Download CV (PDF)".
   - **Deep Linking:** Direct navigation via `/tutor/profile`.
2. **Saved Jobs (`/tutor/saved-jobs`):**
   - Grid of saved tuition jobs with status indicators (`OPEN`, `FILLED`, `CANCELLED`, `EXPIRED`).
   - Filters (status, area) and sorting (recently saved, salary).
   - Instant unsave with "Undo" toast support and bulk removal.
3. **Saved Tutors (`/guardian/saved-tutors`):**
   - Guardian bookmarks for favorite tutors.
   - **3-Tutor Side-by-Side Comparison:** Compare experience, university, rating, subjects, and salary range.
   - Quick "Invite to Tuition" modal for active guardian tuition posts.

---

## 5. Verification & Testing

Run the automated test suite:
```bash
npm test
```
The test suite validates:
1. Bangladeshi phone regex `01[3-9]\d{8}`.
2. Bio text sanitizer (stripping contact numbers and links).
3. Public whitelist serializer (masking and strict exclusion of phone, email, NID, address, documents, and parent info).
4. Profile completion calculation and >= 80% application gating.
5. Zod schema input validation.

Production build verification:
```bash
npm run build
```
Builds cleanly with exit code 0 (`vite build` and `esbuild server.ts`).
