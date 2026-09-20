# TalentSphere Database Schema Documentation

## Overview

This directory contains the complete database schema for TalentSphere, implemented as sequential SQL migrations for Supabase (PostgreSQL).

## Migration Files

### 001_core_extensions_enums.sql
**Purpose**: Sets up PostgreSQL extensions and enum types.

**Extensions**:
- `uuid-ossp`: UUID generation
- `pgcrypto`: Cryptographic functions

**Enum Types Created**:
- `user_role`: candidate, recruiter, hiring_manager, interviewer, admin, etc.
- `candidate_availability_status`: available, employed, open_to_work, not_interested
- `profile_visibility`: public, connections, private
- `skill_proficiency_level`: beginner, intermediate, advanced, expert
- `job_type`, `work_mode`, `job_status`, `experience_level`
- `application_status`: submitted, screening, under_review, etc.
- `course_level`, `content_type`, `enrollment_status`
- `challenge_type`, `challenge_status`, `challenge_difficulty`
- `xp_source`, `badge_category`
- `notification_type`, `notification_channel`, `notification_priority`
- And many more...

---

### 002_users_organizations.sql
**Purpose**: Core user management and organization tables.

**Tables Created**:
1. **organizations** - Company/institution information
2. **users** - Extended user data (linked to auth.users)
3. **candidate_profiles** - Detailed candidate profile data
4. **skills** - Canonical skill taxonomy
5. **candidate_skills** - Junction table for verified skills
6. **experience** - Work experience history
7. **education** - Education history
8. **certifications** - Professional certifications
9. **portfolio_items** - Project portfolio
10. **badges** - Badge definitions
11. **candidate_badges** - Earned badges

**Key Features**:
- Full-text search indexes on names and descriptions
- Automatic updated_at triggers
- Comprehensive indexing for common queries

---

### 003_jobs_applications.sql
**Purpose**: Job board and Applicant Tracking System (ATS).

**Tables Created**:
1. **jobs** - Job requisitions
2. **applications** - Job applications
3. **hiring_pipeline_stages** - Customizable hiring stages
4. **scorecards** - Interviewer evaluations
5. **application_activity_log** - Audit trail

**Key Features**:
- 5-stage application pipeline support
- Scorecard-based evaluations
- Complete audit logging

---

### 004_lms.sql
**Purpose**: Learning Management System.

**Tables Created**:
1. **courses** - Course definitions
2. **course_modules** - Course sections
3. **lessons** - Individual lessons
4. **quizzes** - Quiz definitions
5. **quiz_questions** - Quiz questions
6. **assignments** - Assignment definitions
7. **enrollments** - User enrollments
8. **lesson_progress** - Per-lesson completion tracking
9. **assignment_submissions** - Student submissions
10. **course_reviews** - Reviews and ratings
11. **certificates** - Completion certificates

**Key Features**:
- Hierarchical course structure (Course → Module → Lesson)
- Progress tracking per lesson
- Quiz and assignment support
- Certificate generation

---

### 005_challenges.sql
**Purpose**: Code Arena / Assessment system.

**Tables Created**:
1. **challenges** - Coding challenge definitions
2. **test_cases** - Test cases for challenges
3. **challenge_submissions** - User submissions
4. **test_results** - Individual test results
5. **challenge_attempts** - Attempt tracking
6. **challenge_leaderboard** (Materialized View) - Leaderboard

**Key Features**:
- Multiple challenge types (coding, multiple choice, practical)
- Hidden test cases
- Execution time and memory tracking
- Real-time leaderboard

---

### 006_gamification_notifications.sql
**Purpose**: Gamification, notifications, messaging, and B2B features.

**Tables Created**:
1. **xp_transactions** - XP point transactions
2. **notifications** - User notifications
3. **notification_preferences** - User preferences
4. **conversations** - Messaging conversations
5. **conversation_participants** - Conversation participants
6. **messages** - Individual messages
7. **institutions** - B2B institution data
8. **licenses** - Institutional licenses
9. **cohorts** - Student cohorts
10. **analytics_events** - Analytics tracking
11. **audit_log** - System audit trail

**Key Features**:
- Complete XP ledger with balance tracking
- Multi-channel notifications (in-app, email, push)
- Real-time messaging
- B2B institutional support

---

### 007_rls_policies.sql
**Purpose**: Row Level Security policies for data protection.

**Key Features**:
- RLS enabled on all tables
- Helper functions: `get_current_user_id()`, `is_admin()`, `is_recruiter()`, etc.
- Profile visibility controls (public/connections/private)
- Organization-based isolation
- Role-based access control
- Candidate data protection
- Employer/recruiter permissions
- Course enrollment restrictions
- Challenge submission ownership
- Notification privacy
- Messaging participant-only access

**Security Principles**:
1. Users can always access their own data
2. Public data is visible to all authenticated users
3. Private data requires explicit permission
4. Admins have override access
5. Organization members can see each other's work data

---

### 008_auth_trigger_functions.sql
**Purpose**: Authentication triggers and helper functions.

**Functions Created**:
1. **handle_new_user()** - Auto-provisions user records on signup
2. **award_xp()** - Awards XP points and updates levels
3. **get_level_from_xp()** - Calculates level from XP
4. **complete_course_enrollment()** - Handles course completion
5. **submit_challenge_solution()** - Creates challenge submissions

**Trigger**:
- `on_auth_user_created` - Fires after new user signup

**Key Features**:
- Automatic user provisioning
- Welcome notification on signup
- XP awarding with level-up detection
- Certificate generation on course completion
- Attempt limit enforcement for challenges

---

## Installation

### Prerequisites
1. Supabase project created
2. Database access with migration privileges

### Apply Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL editor in Supabase dashboard
# Copy each migration file content and execute in order
```

### Verify Installation

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check trigger exists
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

## Entity Relationship Summary

```
auth.users (Supabase Auth)
    ↓ (1:1)
users
    ↓ (1:1)
candidate_profiles
    ├─→ candidate_skills (M:N with skills)
    ├─→ experience (1:M)
    ├─→ education (1:M)
    ├─→ certifications (1:M)
    ├─→ portfolio_items (1:M)
    └─→ candidate_badges (M:N with badges)

organizations
    ↓ (1:M)
users (via organization_id)

users (as employer)
    ↓ (1:M)
jobs
    ↓ (1:M)
applications
    ├─→ candidate_profiles (M:1)
    └─→ scorecards (1:M)

courses
    ↓ (1:M)
course_modules
    ↓ (1:M)
lessons
    ├─→ quizzes (1:1)
    │   └─→ quiz_questions (1:M)
    └─→ assignments (1:1)

users
    ↓ (M:N via enrollments)
courses
    ↓ (1:M)
lesson_progress
    ↓ (1:M)
assignment_submissions

challenges
    ↓ (1:M)
test_cases
    ↓ (1:M)
challenge_submissions
    └─→ test_results (1:M)
```

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing RLS Policies

```sql
-- Test as a specific user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid-here"}';

-- Try to access data
SELECT * FROM candidate_profiles WHERE user_id = 'user-uuid-here';
-- Should succeed for own profile

SELECT * FROM candidate_profiles WHERE user_id = 'other-user-uuid';
-- Should fail or return limited data based on visibility
```

## Next Steps

After applying these migrations:

1. **Seed initial data** - Add default skills taxonomy
2. **Create storage buckets** - For resumes, avatars, course content
3. **Set up Edge Functions** - For code execution, email sending
4. **Configure auth providers** - Email/password, OAuth providers
5. **Build frontend** - Connect UI to database via Supabase client

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Database**: PostgreSQL 15+ (via Supabase)
