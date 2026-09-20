# TalentSphere Database Setup Guide

## Quick Start

This guide will help you set up the TalentSphere database schema in your Supabase project.

## Prerequisites

1. **Node.js 20+** installed
2. **Supabase account** (free tier is sufficient)
3. **Supabase CLI** installed (`npm install -g supabase`)

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: talentsphere (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Choose closest to your users
4. Wait for project creation (~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...` - keep this secret!)

## Step 3: Configure Environment Variables

```bash
cd talentsphere
cp .env.example .env.local
```

Edit `.env.local` and paste your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Apply Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# Login to Supabase
supabase login

# Link your project (get project ID from dashboard URL)
supabase link --project-ref your-project-ref

# Push all migrations to your database
supabase db push
```

### Option B: Manual SQL Execution

1. Go to **SQL Editor** in Supabase dashboard
2. Execute each migration file in order:
   - `001_core_extensions_enums.sql`
   - `002_users_organizations.sql`
   - `003_jobs_applications.sql`
   - `004_lms.sql`
   - `005_challenges.sql`
   - `006_gamification_notifications.sql`
   - `007_rls_policies.sql`
   - `008_auth_trigger_functions.sql`

Copy/paste each file's content into the SQL editor and run.

## Step 5: Verify Installation

Run these queries in the Supabase SQL Editor to verify everything is set up correctly:

```sql
-- Check table count (should be 40+)
SELECT COUNT(*) AS table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check enum types (should be 25+)
SELECT COUNT(*) AS enum_count 
FROM pg_type 
WHERE typtype = 'e';

-- Verify RLS is enabled on tables
SELECT COUNT(*) AS rls_enabled_count 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check trigger exists
SELECT tgname AS trigger_name 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## Step 6: Seed Initial Data (Optional)

Add some initial skills to the taxonomy:

```sql
-- Insert sample skills
INSERT INTO skills (name, category, subcategory, is_verified) VALUES
  ('JavaScript', 'Programming Language', 'Web Development', true),
  ('TypeScript', 'Programming Language', 'Web Development', true),
  ('React', 'Framework', 'Web Development', true),
  ('Node.js', 'Framework', 'Backend Development', true),
  ('Python', 'Programming Language', 'General Purpose', true),
  ('SQL', 'Database', 'Data Management', true),
  ('PostgreSQL', 'Database', 'Relational Database', true),
  ('Git', 'Tool', 'Version Control', true),
  ('Docker', 'Tool', 'DevOps', true),
  ('AWS', 'Cloud Platform', 'Cloud Services', true);
```

## Step 7: Test User Signup

Test the auth trigger by creating a test user:

```sql
-- This would normally be done through the app signup flow
-- But you can test via Supabase Auth UI

-- After signup, verify the trigger worked:
SELECT 
  u.id,
  u.email,
  u.role,
  cp.headline,
  cp.xp_points,
  cp.level
FROM users u
LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 5;
```

## Common Issues & Solutions

### Issue: "relation already exists"

**Solution**: The migrations were already applied. Either:
- Drop and recreate the database (for development)
- Or skip already-applied migrations

### Issue: "permission denied"

**Solution**: Ensure you're using the service_role key for migrations, not the anon key.

### Issue: RLS policies blocking access

**Solution**: 
- Verify you're authenticated when testing
- Check that the user has the correct role
- Review the RLS policy conditions

### Issue: Trigger not firing

**Solution**:
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Recreate if missing
\i supabase/migrations/008_auth_trigger_functions.sql
```

## Next Steps

After database setup:

1. **Create Storage Buckets** (in Supabase Dashboard → Storage):
   - `avatars` - User profile pictures
   - `resumes` - Resume PDFs
   - `course-content` - Course materials
   - `portfolio` - Portfolio media

2. **Configure Authentication**:
   - Enable Email/Password authentication
   - Optionally add OAuth providers (Google, GitHub, LinkedIn)
   - Configure email templates

3. **Start Building Frontend**:
   ```bash
   npm install
   npm run dev
   ```

4. **Implement Core Features**:
   - Authentication pages (signup/login)
   - Candidate profile management
   - Job board
   - Course catalog
   - Code Arena

## Migration Order Reference

| # | File | Tables Created | Purpose |
|---|------|---------------|---------|
| 1 | `001_core_extensions_enums.sql` | 0 | Extensions & 25+ enum types |
| 2 | `002_users_organizations.sql` | 11 | Users, profiles, skills |
| 3 | `003_jobs_applications.sql` | 5 | Jobs & ATS |
| 4 | `004_lms.sql` | 11 | Learning Management |
| 5 | `005_challenges.sql` | 6 | Code Arena |
| 6 | `006_gamification_notifications.sql` | 11 | XP, notifications, messaging |
| 7 | `007_rls_policies.sql` | 0 | Security policies |
| 8 | `008_auth_trigger_functions.sql` | 0 | Triggers & functions |

**Total**: 44 tables, 25+ enums, 50+ indexes, 5 triggers, 10+ functions

## Support

For issues or questions:
- Check the [README.md](./README.md) for schema documentation
- Review the [TalentSphere Project Specification](../TalentSphere%20Project%20&%20Product%20Specification.md)
- Consult Supabase documentation: https://supabase.com/docs

---

**Last Updated**: 2024  
**Schema Version**: 1.0.0  
**Compatible With**: Supabase PostgreSQL 17+
