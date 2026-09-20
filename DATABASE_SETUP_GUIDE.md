# TalentSphere Database & Supabase Setup Guide

**Project Reference**: `qumgxoscwrygwykbojym`  
**Region**: `aws-0-ap-southeast-2` (Sydney)  
**Database Host**: `aws-0-ap-southeast-2.pooler.supabase.com:5432`  
**Current Status**: 100% Synchronized, Migrated & Verified  
**Last Verified**: 2026-09-20  

---

## 1. Prerequisites & Project Credentials

1. **Supabase Account & Project**: Active project `qumgxoscwrygwykbojym`
2. **Environment Variables**: Stored in `.env.local` (template in `.env.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://qumgxoscwrygwykbojym.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres.qumgxoscwrygwykbojym:talentsphere-complete@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres
   ```

---

## 2. Supabase CLI Setup (Automated & Recommended)

This workflow is already completed and verified for this repository.

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```
*Follow the interactive prompt or open the verification URL in your browser to authorize your CLI session.*

### Step 3: Link Project
```bash
supabase link --project-ref qumgxoscwrygwykbojym
```

> [!IMPORTANT]
> The `--project-ref` argument requires the exact **20-character lowercase project reference ID** (`qumgxoscwrygwykbojym`). Passing the project display name (`talentsphere-complete`) or placeholder strings will fail.

### Step 4: Configuration File (`supabase/config.toml`)
Ensure the project configuration in `supabase/config.toml` matches:
```toml
project_id = "qumgxoscwrygwykbojym"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = [
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/dashboard",
  "http://localhost:3000/auth/verify",
  "http://localhost:3000/auth/reset-password"
]

[auth.sms]
enable_signup = true
max_frequency = "10s" # Note: Duration must be a quoted string in TOML
```

> [!WARNING]
> In `supabase/config.toml`, values specifying time intervals (such as `max_frequency = "10s"`) must be enclosed in quotes. An unquoted value like `10s` causes a TOML syntax error.

### Step 5: Push Migrations to Remote Database
```bash
supabase db push
```
Output:
```
Initialising login role...
Connecting to remote database...
Remote database is up to date.
```

---

## 3. Storage Buckets & Policies Setup

TalentSphere requires 5 dedicated storage buckets with specific Row Level Security (RLS) policies:

| Bucket Name | Privacy | Allowed MIME Types | Purpose |
|-------------|---------|--------------------|---------|
| `avatars` | **Public** | `image/jpeg`, `image/png`, `image/webp` | Candidate and recruiter avatars |
| `portfolio` | **Public** | Images, videos, PDFs | Candidate project portfolio artifacts |
| `resumes` | **Private** | `application/pdf`, `.doc`, `.docx` | Candidate CVs & resumes |
| `course-content` | **Private** | Documents, videos, lesson files | LMS course instructor materials |
| `talentsphere_bucket` | **Private** | General documents | System backups & asset attachments |

### Automated Storage Setup Script
Instead of configuring buckets and RLS policies manually in the dashboard, run the automated setup script:
```bash
npm run db:setup-storage
# Or directly: node scripts/setup-storage.js
```

This script:
1. Sets `public = true` for `avatars` and `portfolio`.
2. Creates RLS policies on `storage.objects`:
   - `Anyone can read avatars` (SELECT)
   - `Users can upload own avatar` (INSERT where folder = auth.uid())
   - `Users can update own avatar` (UPDATE where folder = auth.uid())
   - `Users can delete own avatar` (DELETE where folder = auth.uid())
   - `Users can read own resumes` (SELECT where folder = auth.uid())
   - `Users can upload own resumes` (INSERT where folder = auth.uid())
   - `Users can update own resumes` (UPDATE where folder = auth.uid())
   - `Users can delete own resumes` (DELETE where folder = auth.uid())
   - `Anyone can read portfolio` (SELECT)
   - `Users can upload own portfolio` (INSERT where folder = auth.uid())
   - `Users can update own portfolio` (UPDATE where folder = auth.uid())
   - `Users can delete own portfolio` (DELETE where folder = auth.uid())

---

## 4. Manual Setup (SQL Editor Alternative)

If migrating a new environment manually without the CLI, apply the 8 SQL migrations in **EXACT ORDER** via the Supabase Dashboard SQL Editor:

1. `supabase/001_core_extensions_enums.sql` — Extensions (`uuid-ossp`, `pgcrypto`), core enum types.
2. `supabase/002_users_organizations.sql` — `users`, `organizations`, `candidate_profiles`, sub-entities (`experience`, `education`, `certifications`, `portfolio_items`, `candidate_skills`), `skills`, `scorecards`.
3. `supabase/003_jobs_applications.sql` — `jobs`, `job_bookmarks`, `applications`, `hiring_pipeline_stages`, `application_activity_log`.
4. `supabase/004_lms.sql` — `courses`, `course_modules`, `course_lessons`, `course_enrollments`, `lesson_completions`, `course_quizzes`, `quiz_questions`, `quiz_answers`, `quiz_attempts`, `quiz_responses`, `certificates`.
5. `supabase/005_challenges.sql` — `challenges`, `challenge_categories`, `challenge_test_cases`, `challenge_submissions`, `challenge_attempts`, `challenge_ratings`, `challenge_comments`.
6. `supabase/006_gamification_notifications.sql` — `user_levels`, `xp_ledger`, `badges`, `candidate_badges`, `leaderboard_entries`, `notifications`, `notification_preferences`, `notification_templates`, `conversations`, `conversation_participants`, `messages`, `message_reads`.
7. `supabase/007_rls_policies.sql` — Row Level Security policies across all 46 tables.
8. `supabase/008_auth_trigger_functions.sql` — Triggers (`on_auth_user_created`, `update_user_level`, `award_xp`, profile calculation).

---

## 5. Verification & Diagnostics

### A. Run Database Audit
Run the automated verification script to audit schemas, tables, triggers, and RLS:
```bash
npm run db:verify
# Or: node scripts/verify-db.js
```

**Verified Schema Manifest:**
- **Public Tables**: 46 / 46 (100% RLS enabled)
- **Enum Types**: 48 types registered
- **Triggers**: 37 triggers active
- **Functions**: 13 functions active
- **Storage Buckets**: 5 buckets verified

### B. Run Automated Integration & Unit Tests
Run the comprehensive test runner to verify database joins, relations, and operations:
```bash
npm test
```
**Results**: 29 / 29 passing tests:
- Live database queries on all candidate sub-entities (`experience`, `education`, `certifications`, `portfolio_items`, `candidate_skills`).
- Multi-table joins across `applications`, `candidate_profiles`, `users`, and `hiring_pipeline_stages`.
- Recruiter interview scorecards query on `public.scorecards`.
- Gamification tables (`user_levels`, `xp_ledger`).
- Utility functions and helpers (`formatCurrency`, `calculateLevel`, `slugify`, `cn`, etc.).

---

## 6. Next Steps & Ongoing Verification

Follow these steps to test and verify the live application:

- [x] **Step 1: Install CLI & Link Project** (`supabase link --project-ref qumgxoscwrygwykbojym`)
- [x] **Step 2: Sync Migrations** (`supabase db push` → Remote DB up to date)
- [x] **Step 3: Setup Storage Buckets** (`npm run db:setup-storage`)
- [x] **Step 4: Verify Database Health** (`npm run db:verify`)
- [x] **Step 5: Run Automated Tests** (`npm test`)
- [ ] **Step 6: Start Local Development Server**
  ```bash
  npm run dev
  ```
  App will be accessible at: `http://localhost:3000`
- [ ] **Step 7: Test Authentication Journey**
  1. Navigate to `http://localhost:3000/auth/signup`
  2. Create an account with email, password, full name, and role (`candidate` or `recruiter`).
  3. Verify automatic redirect to `http://localhost:3000/auth/verify`.
  4. Sign in at `http://localhost:3000/auth/signin` and verify redirect to `/dashboard`.
- [ ] **Step 8: Test Candidate Profile Management**
  1. Navigate to `http://localhost:3000/candidates/profile`.
  2. Upload avatar and resume PDF.
  3. Add skills, work experience, education, and portfolio items.
- [ ] **Step 9: Test Recruiter Job & Applicant Pipeline**
  1. Navigate to `http://localhost:3000/jobs/post`.
  2. Publish a job requisition.
  3. Navigate to `http://localhost:3000/applications` or `/jobs/[id]/applications`.
  4. Test Kanban stage drag/advance, candidate evaluation modal, and interview scorecard submission.
- [ ] **Step 10: Run End-to-End Suite**
  ```bash
  npx.cmd playwright test
  ```

---

## 7. Troubleshooting Common Issues

### 1. `Invalid TOML document: invalid value` on `supabase db push`
- **Cause**: Duration parameters like `max_frequency = 10s` must be quoted string literals.
- **Fix**: Update `supabase/config.toml` to `max_frequency = "10s"`.

### 2. `Cannot resolve "your-project-id": it is not a project ref`
- **Cause**: Using placeholder text or project name instead of the Supabase reference code.
- **Fix**: Use `supabase link --project-ref qumgxoscwrygwykbojym`.

### 3. Missing Storage Policies on Resume/Avatar Upload
- **Cause**: Storage buckets exist but RLS policies were not created on `storage.objects`.
- **Fix**: Execute `node scripts/setup-storage.js` to create all required policies automatically.

### 4. Running Scripts Disabled on Windows PowerShell (`PSSecurityException`)
- **Cause**: Windows PowerShell execution policy restricts `.ps1` execution.
- **Fix**: Use `.cmd` extensions explicitly: `npm.cmd`, `npx.cmd`, or run via `cmd.exe`.
